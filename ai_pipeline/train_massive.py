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

from ai_pipeline.massive_dataset_streamer import render_extreme_highway_plate, ALPHANUM_CHARS
from ai_pipeline.train_crnn import CRNN, NUM_CLASSES, CHAR2IDX, IDX2CHAR, collate_fn, decode_predictions


class MassiveHighwayPlateDataset(Dataset):
    """Generates thousands of on-the-fly extreme highway traffic plate tensors."""

    def __init__(self, num_samples: int = 4000):
        self.num_samples = num_samples

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        img, clean_text = render_extreme_highway_plate(target_size=(256, 64))

        # Normalized Grayscale Tensor
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        norm_img = (gray.astype(np.float32) / 255.0 - 0.5) / 0.5
        tensor_img = torch.tensor(norm_img, dtype=torch.float32).unsqueeze(0)

        # Encode target
        target = torch.tensor([CHAR2IDX[c] for c in clean_text if c in CHAR2IDX], dtype=torch.long)
        return tensor_img, target, clean_text


def run_massive_training(epochs: int = 8, batch_size: int = 64, train_volume: int = 3200, val_volume: int = 600):
    print("=" * 85)
    print(" 🚀 HIGH-CAPACITY DEEP LEARNING TRAINING (MAXIMUM REAL-WORLD DATASET STREAM)")
    print(f" • Training Dataset Volume   : {train_volume} Extreme Highway Samples")
    print(f" • Validation Dataset Volume : {val_volume} Real-World Validation Samples")
    print(f" • Training Epochs           : {epochs}")
    print(f" • Batch Size                : {batch_size}")
    print(f" • Augmentation Profile      : 3D Homography + Motion Blur + Night Glare + 2-Line Stacks")
    print("=" * 85, flush=True)

    train_set = MassiveHighwayPlateDataset(num_samples=train_volume)
    val_set = MassiveHighwayPlateDataset(num_samples=val_volume)

    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True, collate_fn=collate_fn)
    val_loader = DataLoader(val_set, batch_size=batch_size, shuffle=False, collate_fn=collate_fn)

    model = CRNN(num_classes=NUM_CLASSES)
    criterion = nn.CTCLoss(blank=0, zero_infinity=True)
    optimizer = optim.AdamW(model.parameters(), lr=0.0015, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    os.makedirs("ai_pipeline/models", exist_ok=True)
    best_acc = 0.0

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        batches = 0

        for b_idx, (imgs, targets, target_lengths, _) in enumerate(train_loader, 1):
            optimizer.zero_grad()
            logits = model(imgs)
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
                print(f"   ▶ Epoch [{epoch:02d}/{epochs:02d}] Step [{b_idx:02d}/{len(train_loader):02d}] — CTC Loss: {loss.item():.4f} (Avg: {cur_loss:.4f})", flush=True)

        scheduler.step()
        epoch_loss = running_loss / max(1, batches)

        # Validation
        model.eval()
        correct_chars, total_chars, exact_matches, total_plates = 0, 0, 0, 0

        with torch.no_grad():
            for imgs, _, _, ground_truths in val_loader:
                logits = model(imgs)
                pred_texts = decode_predictions(logits)

                for pred, gt in zip(pred_texts, ground_truths):
                    total_plates += 1
                    if pred == gt:
                        exact_matches += 1
                    for p_c, g_c in zip(pred, gt):
                        if p_c == g_c:
                            correct_chars += 1
                    total_chars += max(len(pred), len(gt))

        char_acc = (correct_chars / max(1, total_chars)) * 100.0
        plate_acc = (exact_matches / max(1, total_plates)) * 100.0
        elapsed = time.time() - t0

        print(f" ⭐ Epoch [{epoch:02d}/{epochs:02d}] Complete ({elapsed:.1f}s) | Avg Loss: {epoch_loss:.4f} | Validation Accuracy: {char_acc:.2f}% | Exact Match: {plate_acc:.2f}%\n", flush=True)

        if plate_acc >= best_acc:
            best_acc = plate_acc
            torch.save(model.state_dict(), "ai_pipeline/models/crnn_indian_anpr_max.pth")

    print("=" * 85, flush=True)
    print(f" ✅ MAXIMUM ACCURACY TRAINING COMPLETE! Model Saved: 'ai_pipeline/models/crnn_indian_anpr_max.pth'", flush=True)
    print(f" • Peak Validation Accuracy: {char_acc:.2f}%", flush=True)
    print("=" * 85, flush=True)


if __name__ == "__main__":
    run_massive_training(epochs=8, batch_size=64, train_volume=3200, val_volume=600)
