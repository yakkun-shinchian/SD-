# Local-model sizing rules

## First-order weight estimate

Approximate raw weight memory:

`parameters × bits per weight ÷ 8`

Then add runtime overhead, quantization metadata, temporary buffers, and KV cache. Do not present the raw weight estimate as the final requirement.

Typical planning ranges, to be verified for the exact runtime:

- 4-bit weights: roughly 0.5 bytes per parameter before overhead.
- 8-bit weights: roughly 1 byte per parameter before overhead.
- FP16/BF16 weights: roughly 2 bytes per parameter before overhead.

For Apple Silicon, unified memory is shared by model weights, KV cache, applications, and the operating system. Leave substantial headroom rather than filling advertised memory.

## KV cache and concurrency

KV cache grows with model architecture, context length, cache precision, batch size, and concurrent sequences. Obtain an exact runtime estimate or measure it with the chosen build. Long context and high concurrency can consume more memory than the quantized weights.

Use one shared inference server with batching when many agents take turns. Replicate the model only when isolation, latency, or throughput measurements justify the extra memory.

## Model selection checks

- Confirm exact GGUF filename and quant label from the official repository tree.
- Prefer an official or reputable conversion with a clear base-model reference and license.
- Check chat template, tool-calling support, context limit, multilingual/Japanese quality, and benchmark conditions.
- Treat MoE “active parameter” claims as compute hints, not weight-memory estimates; all expert weights may still need storage and memory.

## Primary references

- Hugging Face local-model skill source: https://github.com/huggingface/skills/tree/main/skills/huggingface-local-models
- Hugging Face model hub: https://huggingface.co/models
- llama.cpp repository and documentation: https://github.com/ggml-org/llama.cpp

Verify current hardware specifications from the manufacturer before a purchase recommendation.

