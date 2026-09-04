import torch
import numpy as np
import time
from app.services.ai.vovera_shield import VoveraShield

def generate_tone(frequency, duration, sample_rate=16000):
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    tone = np.sin(frequency * t * 2 * np.pi)
    return torch.from_numpy(tone).float().unsqueeze(0)

def generate_noise(duration, sample_rate=16000):
    noise = np.random.normal(0, 0.5, int(sample_rate * duration))
    return torch.from_numpy(noise).float().unsqueeze(0)

def calculate_score(variance, phonetic_mean):
    # This is the exact math from main.py
    acoustic_score = abs(variance * 10)
    phonetic_score = abs(phonetic_mean * 5)
    risk_score = min(100, int(acoustic_score + phonetic_score))
    return risk_score, acoustic_score, phonetic_score

def run_tests():
    print("Loading Shield...")
    shield = VoveraShield()
    
    print("\n--- TEST 1: Normal Human Speech (Simulated via pure tone) ---")
    human_audio = generate_tone(440, 1.0) # 1 second of 440Hz tone
    res_human = shield.analyze_audio_chunk(human_audio)
    v1 = res_human.get('acoustic_variance', 0)
    p1 = res_human.get('phonetic_marker', 0)
    score1, a1, ph1 = calculate_score(v1, p1)
    print(f"Raw Variance: {v1:.4f}, Raw Mean: {p1:.4f}")
    print(f"Acoustic: {a1:.1f}, Phonetic: {ph1:.1f} -> TOTAL SCORE: {score1}")

    print("\n--- TEST 2: Deepfake / Artifacts (Simulated via harsh white noise) ---")
    noise_audio = generate_noise(1.0) # 1 second of noise
    res_noise = shield.analyze_audio_chunk(noise_audio)
    v2 = res_noise.get('acoustic_variance', 0)
    p2 = res_noise.get('phonetic_marker', 0)
    score2, a2, ph2 = calculate_score(v2, p2)
    print(f"Raw Variance: {v2:.4f}, Raw Mean: {p2:.4f}")
    print(f"Acoustic: {a2:.1f}, Phonetic: {ph2:.1f} -> TOTAL SCORE: {score2}")

    print("\n--- TEST 3: Silence ---")
    silence = torch.zeros(1, 16000)
    res_sil = shield.analyze_audio_chunk(silence)
    v3 = res_sil.get('acoustic_variance', 0)
    p3 = res_sil.get('phonetic_marker', 0)
    score3, a3, ph3 = calculate_score(v3, p3)
    print(f"Raw Variance: {v3:.4f}, Raw Mean: {p3:.4f}")
    print(f"Acoustic: {a3:.1f}, Phonetic: {ph3:.1f} -> TOTAL SCORE: {score3}")

if __name__ == "__main__":
    run_tests()
