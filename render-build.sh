#!/usr/bin/env bash
# Render Build Script for POLARIS
set -o errexit

echo ">>> [1/3] Installing frontend dependencies & building React client..."
npm install --prefix client
npm run build --prefix client

echo ">>> [2/3] Installing Python backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ">>> [3/3] Initializing and seeding POLARIS database..."
python -m backend.app.db.seed

echo ">>> Build completed successfully for Render!"
