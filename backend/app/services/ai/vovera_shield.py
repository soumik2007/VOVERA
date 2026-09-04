import torch
import torchaudio
from transformers import AutoProcessor, HubertModel, T5Tokenizer, T5ForConditionalGeneration
from speechbrain.inference.speaker import EncoderClassifier
import io

class VoveraShield:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Vovera Shield] Initializing on device: {self.device}")
        
        # 1. Acoustic Layer: ECAPA-TDNN
        print("[Vovera Shield] Loading ECAPA-TDNN (Acoustic Shield)...")
        self.ecapa = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb", 
            run_opts={"device": self.device}
        )
        
        # 2. Phonetic Layer: HuBERT
        print("[Vovera Shield] Loading HuBERT (Phonetic Shield)...")
        self.hubert_processor = AutoProcessor.from_pretrained("facebook/hubert-base-ls960")
        self.hubert = HubertModel.from_pretrained("facebook/hubert-base-ls960").to(self.device)
        
        # 3. Semantic Layer: FLAN-T5
        print("[Vovera Shield] Loading FLAN-T5 (Semantic Shield)...")
        self.t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
        self.t5 = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small").to(self.device)
        
        print("[Vovera Shield] ALL MODELS LOADED SUCCESSFULLY.")

    def analyze_audio_chunk(self, audio_tensor: torch.Tensor, sample_rate: int = 16000):
        """
        Runs the audio chunk through ECAPA-TDNN and HuBERT simultaneously.
        """
        # Ensure 16kHz
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            audio_tensor = resampler(audio_tensor)

        results = {}
        
        with torch.no_grad():
            # 1. ECAPA-TDNN Analysis
            embeddings = self.ecapa.encode_batch(audio_tensor)
            # In a real deepfake detector, we compare these embeddings to known synthetic profiles
            # or pass them into an AASIST classifier. Here we extract feature variances.
            variance = torch.var(embeddings).item()
            results['acoustic_variance'] = variance
            
            # 2. HuBERT Analysis
            inputs = self.hubert_processor(audio_tensor.squeeze().numpy(), sampling_rate=16000, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            hubert_outputs = self.hubert(**inputs)
            # Extract last hidden state mean as a phonetic representation
            phonetic_mean = torch.mean(hubert_outputs.last_hidden_state).item()
            results['phonetic_marker'] = phonetic_mean
            
        return results

    def analyze_transcript(self, transcript: str):
        """
        Runs the transcribed text through FLAN-T5 to detect scam intent.
        """
        prompt = f"Is the following text a phone scam or social engineering attempt? Answer 'yes' or 'no'. Text: {transcript}"
        inputs = self.t5_tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.t5.generate(**inputs, max_length=10)
            
        answer = self.t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return {
            "transcript": transcript,
            "scam_intent_detected": "yes" in answer.lower(),
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