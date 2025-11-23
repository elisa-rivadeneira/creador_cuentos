#!/bin/bash
# Script de backup de la base de datos

# Crear directorio de backups si no existe
mkdir -p ./backups

# Crear backup con timestamp
timestamp=$(date +"%Y%m%d_%H%M%S")
cp ./production.db "./backups/production_backup_${timestamp}.db"

# Mantener solo los últimos 7 backups
ls -t ./backups/production_backup_*.db | tail -n +8 | xargs -r rm

echo "Backup creado: production_backup_${timestamp}.db"