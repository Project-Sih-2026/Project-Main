import os
import sys
import time
import cv2
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.dataset_generator import (
    render_augmented_plate_image,
    generate_random_indian_plate_text,
    ALPHANUM_CHARS
)

# 36 Characters: 0-9, A-Z + Blank Token for CTC
CHARACTERS = ALPHANUM_CHARS
CHAR2IDX = {char: idx + 1 for idx, char in enumerate(CHARACTERS)} # 0 reserved for CTC blank
IDX2CHAR = {idx + 1: char for idx, char in enumerate(CHARACTERS)}
NUM_CLASSES = len(CHARACTERS) + 1


class CRNN(nn.Module):
    """
    CRNN (Convolutional Recurrent Neural Network) for Deep Sequence OCR.
    Extracts visual features via CNN -> Models character transitions via BiLSTM -> CTC Projection.
    """

    def __init__(self, num_classes=NUM_CLASSES):
        super(CRNN, self).__init__()

        # CNN Feature Extractor
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(True),
            nn.MaxPool2d(2, 2), # 128 x 32

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            nn.MaxPool2d(2, 2), # 64 x 16

            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(True),

            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(True),
            nn.MaxPool2d((2, 1), (2, 1)), # 64 x 8

            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(True),
            nn.MaxPool2d((2, 1), (2, 1)), # 64 x 4

            nn.Conv2d(512, 512, kernel_size=2, padding=0),
            nn.BatchNorm2d(512),
            nn.ReLU(True), # 63 x 3
        )

        # Sequence Modeling (BiLSTM)
        self.rnn = nn.Sequential(
            nn.LSTM(512 * 3, 256, bidirectional=True, batch_first=True),
        )
        self.linear = nn.Linear(512, num_classes)

    def forward(self, x):
        # x: (B, 1, H=64, W=256)
        features = self.cnn(x) # (B, 512, H', W')
        b, c, h, w = features.size()

        # Reshape for sequence
        features = features.permute(0, 3, 1, 2) # (B, W', C, H')
        features = features.contiguous().view(b, w, c * h) # (B, W', C*H')

        rnn_out, _ = self.rnn(features) # (B, W', 512)
        logits = self.linear(rnn_out) # (B, W', NUM_CLASSES)

        # CTC expects (Time_steps, Batch, Num_classes)
        logits = logits.permute(1, 0, 2)
        return logits


class IndianPlateDataset(Dataset):
    """Synthetic on-the-fly augmented Indian license plate dataset generator."""

    def __init__(self, num_samples=1000):
        self.num_samples = num_samples

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        text = generate_random_indian_plate_text()
        img, _ = render_augmented_plate_image(text, target_size=(256, 64))

        # Convert to Grayscale & Normalized Tensor (1, 64, 256)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        norm_img = (gray.astype(np.float32) / 255.0 - 0.5) / 0.5
        tensor_img = torch.tensor(norm_img, dtype=torch.float32).unsqueeze(0)

        # Encode target label (remove hyphens for CTC)
        clean_text = text.replace("-", "").upper()
        target = torch.tensor([CHAR2IDX[c] for c in clean_text if c in CHAR2IDX], dtype=torch.long)

        return tensor_img, target, clean_text


def collate_fn(batch):
    imgs, targets, texts = zip(*batch)
    imgs = torch.stack(imgs, 0)
    target_lengths = torch.tensor([len(t) for t in targets], dtype=torch.long)
    targets_concat = torch.cat(targets, 0)
    return imgs, targets_concat, target_lengths, texts


def decode_predictions(logits):
    """CTC greedy best-path decoder."""
    # logits: (T, B, C)
    preds = torch.argmax(logits, dim=2).permute(1, 0) # (B, T)
    decoded_texts = []

    for pred in preds:
        tokens = []
        prev = 0
        for p in pred:
            p_val = p.item()
            if p_val != 0 and p_val != prev:
                if p_val in IDX2CHAR:
                    tokens.append(IDX2CHAR[p_val])
            prev = p_val
        decoded_texts.append("".join(tokens))

    return decoded_texts


def train_model(epochs=6, batch_size=32, train_samples=1200, val_samples=300):
    print("=" * 80)
    print(" 🚀 TRAINING DEEP NEURAL NETWORK (CRNN-CTC) ON INDIAN VEHICLE DATASET")
    print(f" • Training Dataset Volume:   {train_samples} augmented samples")
    print(f" • Validation Dataset Volume: {val_samples} augmented samples")
    print(f" • Total Epochs:              {epochs}")
    print(f" • Batch Size:                {batch_size}")
    print(f" • Device:                    CPU")
    print("=" * 80)

    # 1. Datasets & Loaders
    train_dataset = IndianPlateDataset(num_samples=train_samples)
    val_dataset = IndianPlateDataset(num_samples=val_samples)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, collate_fn=collate_fn)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, collate_fn=collate_fn)

    # 2. Model, Loss, Optimizer
    model = CRNN(num_classes=NUM_CLASSES)
    criterion = nn.CTCLoss(blank=0, zero_infinity=True)
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    # 3. Training Loop
    os.makedirs("ai_pipeline/models", exist_ok=True)
    best_acc = 0.0

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        batches = 0

        for b_idx, (imgs, targets, target_lengths, _) in enumerate(train_loader, 1):
            optimizer.zero_grad()
            logits = model(imgs) # (T=63, B, NUM_CLASSES)
            t_steps, b_size, _ = logits.size()
            input_lengths = torch.full((b_size,), t_steps, dtype=torch.long)

            loss = criterion(logits.log_softmax(2), targets, input_lengths, target_lengths)
            if not torch.isnan(loss) and not torch.isinf(loss):
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 5.0)
                optimizer.step()
                running_loss += loss.item()
            batches += 1

            if b_idx % 10 == 0 or b_idx == len(train_loader):
                cur_loss = running_loss / batches
                print(f"   ▶ Epoch [{epoch:02d}/{epochs:02d}] Step [{b_idx:02d}/{len(train_loader):02d}] — Batch Loss: {loss.item():.4f} (Avg: {cur_loss:.4f})", flush=True)

        scheduler.step()
        epoch_loss = running_loss / max(1, batches)

        # 4. Validation
        model.eval()
        correct_chars = 0
        total_chars = 0
        exact_matches = 0
        total_plates = 0

        with torch.no_grad():
            for imgs, _, _, ground_truths in val_loader:
                logits = model(imgs)
                pred_texts = decode_predictions(logits)

                for pred, gt in zip(pred_texts, ground_truths):
                    total_plates += 1
                    if pred == gt:
                        exact_matches += 1
                    # Character match
                    for p_c, g_c in zip(pred, gt):
                        if p_c == g_c:
                            correct_chars += 1
                    total_chars += max(len(pred), len(gt))

        char_acc = (correct_chars / max(1, total_chars)) * 100.0
        plate_acc = (exact_matches / max(1, total_plates)) * 100.0
        elapsed = time.time() - t0

        print(f" ⭐ Epoch [{epoch:02d}/{epochs:02d}] Complete ({elapsed:.1f}s) | Avg Loss: {epoch_loss:.4f} | Char Acc: {char_acc:.2f}% | Exact Plate Match: {plate_acc:.2f}%\n", flush=True)

        if plate_acc >= best_acc:
            best_acc = plate_acc
            torch.save(model.state_dict(), "ai_pipeline/models/crnn_indian_anpr.pth")

    print("=" * 80, flush=True)
    print(f" ✅ TRAINING COMPLETE! Best Checkpoint: 'ai_pipeline/models/crnn_indian_anpr.pth'", flush=True)
    print(f" • Top Validation Character Accuracy: {char_acc:.2f}%", flush=True)
    print("=" * 80, flush=True)


if __name__ == "__main__":
    train_model(epochs=6, batch_size=32, train_samples=1200, val_samples=300)
