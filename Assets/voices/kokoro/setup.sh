#!/usr/bin/env bash
# Installs Kokoro and downloads the 325 MB model, which is too large to keep in git.
set -euo pipefail
cd "$(dirname "$0")"
pip install --break-system-packages -q kokoro-onnx soundfile
mkdir -p models
if [ ! -f models/kokoro-v1.0.onnx ]; then
  curl -fL -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
fi
if [ ! -f models/voices-v1.0.bin ]; then
  curl -fL -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
fi
echo "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5  models/kokoro-v1.0.onnx" | sha256sum -c -
