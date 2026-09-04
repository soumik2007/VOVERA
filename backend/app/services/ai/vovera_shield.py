import torch
import torchaudio
from transformers import Wav2Vec2FeatureExtractor, HubertModel, T5Tokenizer, T5ForConditionalGeneration
from speechbrain.inference.speaker import EncoderClassifier
import io

class VoveraShield:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Vovera Shield] Initializing on device: {self.device}")
        
        # 1. Load ECAPA-TDNN (SpeechBrain)
        print("[Vovera Shield] Loading ECAPA-TDNN (Acoustic Shield)... (This takes a few seconds, no progress bar)")
        self.ecapa = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir="tmp_models/ecapa",
            run_opts={"device": "cuda" if torch.cuda.is_available() else "cpu"}
        )
        print("[Vovera Shield] ✅ ECAPA-TDNN Loaded Successfully!")
        
        # 2. Load HuBERT (HuggingFace)
        print("[Vovera Shield] Loading HuBERT (Phonetic Analyzer)...")
        self.hubert_processor = Wav2Vec2Processor.from_pretrained("facebook/hubert-large-ls960-ft")
        self.hubert = HubertModel.from_pretrained("facebook/hubert-large-ls960-ft").to(self.device)
        print("[Vovera Shield] ✅ HuBERT Loaded Successfully!")

        # 3. Load Semantic Model (FLAN-T5)
        print("[Vovera Shield] Loading FLAN-T5 (Semantic Intent)...")
        self.t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
        self.t5 = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small").to(self.device)
        print("[Vovera Shield] ✅ FLAN-T5 Loaded Successfully!")
        
        print("-" * 50)
        print("[Vovera Shield] ALL MODELS ONLINE AND READY TO INTERCEPT.")
        print("-" * 50)

    def analyze_audio_chunk(self, audio_tensor: torch.Tensor, sample_rate: int = 16000):
        """
        Runs the audio chunk through ECAPA-TDNN and HuBERT simultaneously.
        """
        # Ensure 16kHz
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            audio_tensor = resampler(audio_tensor)

        with torch.no_grad():
            # 1. ECAPA-TDNN Analysis
            embeddings = self.ecapa.encode_batch(audio_tensor)
            # In a real deepfake detector, we compare these embeddings to known synthetic profiles
            # or pass them into an AASIST classifier. Here we extract feature variances.
            variance = torch.var(embeddings).item()
            
            # 2. HuBERT Analysis
            inputs = self.hubert_processor(audio_tensor.squeeze().numpy(), sampling_rate=16000, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            hubert_outputs = self.hubert(**inputs)
            # Extract last hidden state mean and variance
            phonetic_mean = torch.mean(hubert_outputs.last_hidden_state).item()
            phonetic_var = torch.var(hubert_outputs.last_hidden_state).item()
            
            # 3. Audio Physics
            zcr = (torch.diff(torch.sign(audio_tensor)) != 0).float().mean().item()
            energy_std = torch.std(audio_tensor ** 2).item()

        return {
            "acoustic_variance": variance,
            "phonetic_marker": phonetic_mean,
            "phonetic_variance": phonetic_var,
            "zcr": zcr,
            "energy_std": energy_std
        }

    def analyze_transcript(self, transcript: str):
        """
        Runs the transcribed text through FLAN-T5 to detect scam intent.
        """
        prompt = f"Question: Does this caller sound like a scammer asking for money, personal info, bank details, or passwords? Answer 'yes' or 'no'. Caller: '{transcript}'"
        inputs = self.t5_tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.t5.generate(**inputs, max_length=10)
            
        answer = self.t5_tokenizer.decode(outputs[0], skip_special_tokens=True).strip().lower()
        
        # We also do a quick keyword check since flan-t5-small is very tiny and might miss obvious ones
        suspicious_words = [
            'social security', 'password', 'bank', 'credit card', 'irs', 
            'urgent', 'wire transfer', 'crypto', 'gift card', 'medicare',
            'warranty', 'winner', 'lottery', 'free cruise', 'account suspended',
            'unauthorized', 'cancel this charge', 'refund', 'verification code',
            'otp', 'compromised', 'investigation', 'arrest', 'legal action', 'pin code',
            'accident', 'hospital', 'emergency', 'bail money', 'car crash', 
            'injured', 'jail', 'send money'
        ]
        keyword_flag = any(word in transcript.lower() for word in suspicious_words)
        
        return {
            "transcript": transcript,
            "scam_intent_detected": "yes" in answer or keyword_flag,
            "flan_t5_raw_output": answer
        }

if __name__ == "__main__":
    # Test script to download and verify models
    print("Testing Vovera Shield Initialization...")
    shield = VoveraShield()
    
    # Test FLAN-T5 instantly
    test_text = "Hello, this is the IRS. We need your social security number to clear your warrant."
    print(f"\nTesting Semantic Layer with: '{test_text}'")
    res = shield.analyze_transcript(test_text)
    print("FLAN-T5 Result:", res)