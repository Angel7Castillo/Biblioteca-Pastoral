---
name: capacitor-android
description: Configuración, sincronización offline-first y empaquetado para la aplicación Android de Biblioteca Pastoral con Capacitor.
---

# Skill: Capacitor Android (`capacitor-android`)

Esta skill define la estrategia de empaquetado y funcionamiento nativo en la plataforma Android para Biblioteca Pastoral.

## Principios Fundamentales
1. **Reutilización del Código UI**: La interfaz React creada en `/desktop` se comparte directamente con la carpeta `/mobile` utilizando Capacitor (`@capacitor/core`, `@capacitor/android`).
2. **Offline-First**: Toda nota o sermón creado/editado sin conexión a internet se guarda en el almacenamiento local del dispositivo (IndexedDB / SQLite local) y se marca para sincronización automática cuando el dispositivo recupere conexión con el servidor Proxmox (`http://192.168.1.200`).
3. **Modo Predicador Móvil**:
   - Mantener pantalla encendida (*Keep Screen On*) mediante plugin nativo durante la presentación o predicación.
   - Controles táctiles adaptados para cambiar de punto del bosquejo sin necesidad de teclado físico.
