---
name: offline-sync
description: Estrategia de sincronización offline-first, almacenamiento local y resolución de conflictos entre clientes (Desktop/Móvil) y el servidor Proxmox.
---

# Skill: Offline Sync (`offline-sync`)

Esta skill establece la arquitectura Offline-First para que el pastor pueda crear y editar sermones sin conexión a internet y sincronizarlos automáticamente al conectarse con el servidor Proxmox.

## Principios Offline-First
1. **Fallback Transparente (`api.js`)**:
   - Toda petición a la API intenta conectarse a `http://192.168.1.200/api/v1`.
   - Si la petición falla por tiempo de espera o falta de red (`isOffline = true`), las lecturas y escrituras se redirigen a `localStorage` / `IndexedDB` local.
2. **Cola de Sincronización (`SyncQueue`)**:
   - Operaciones mutativas (`POST`, `PUT`, `DELETE`) en modo sin conexión se encolan con marcas de tiempo (`updated_at`).
   - Al detectar reconexión a la red local/API, se procesa la cola en segundo plano.
3. **Resolución de Conflictos**:
   - Estrategia *Last Write Wins (LWW)* basada en timestamps ISO.
   - Preservación de borradores locales para prevenir pérdida accidental de notas teológicas.
4. **Indicador en Tiempo Real**:
   - Muestra dinámica en la `StatusBar` inferior: `🟢 Proxmox API (192.168.1.200)` o `🟡 Modo Offline`.
