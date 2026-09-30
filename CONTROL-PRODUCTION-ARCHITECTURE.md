# LightingAI CONTROL Architecture

Status: Bluetooth-only primary CONTROL architecture for PR #408.

## Core operator rule

LightingAI CONTROL is built for fast on-set work:

PRONAĐI -> POVEŽI -> DIM / CCT / BOJA / FX

The primary CONTROL path is direct vendor Bluetooth. It must not require DMX patching, Art-Net/sACN setup, external gateway configuration, or switching to separate manufacturer apps.

## Primary vendor families

Required direct Bluetooth families:

- Astera / AsteraApp / BTB
- Aputure / Sidus
- Godox / Godox Light
- Aladdin
- Nanlite / NANLINK
- ARRI / LiCo

Each family remains `required-unverified` until its real transport/session/command behavior is proven by official documentation, an SDK, a publicly verifiable implementation, or repeatable physical testing.

## Safety rule

Do not guess proprietary packets.

A discovered BLE device, successful Android connection, bond state, GATT service discovery, or writable characteristic is not proof of fixture control.

Quick controls stay locked until the vendor driver is physically verified.

## Astera priority

Current reference fixture: Astera Titan Tube FP1-BTB.

Verified workflow facts:

- AsteraApp first connects to a Bluetooth Bridge (BTB).
- A BTB may be built into Titan Tube BTB and other compatible Astera fixtures.
- The BTB relays AsteraApp control to paired Astera lights over the Astera wireless system.
- The physical Titan test has already confirmed BLE visibility and the private LE service fingerprint:
  `0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65`.

The UUID above is diagnostic evidence only. It does not authorize inferred WRITE commands.

Current LightingAI Astera research path:

Astera security boundary confirmed from official manuals:
- Android Bluetooth bonding is only the mobile-to-BTB link layer.
- Astera fixture control is separately protected by a 4-digit Radio PIN.
- Astera documentation states that pairing transmits the Radio PIN from the app to the light and stores it there.
- LightingAI must not treat a successful Android bond as proof of an authenticated Astera control session.
- LightingAI does not generate, guess or transmit a Radio PIN until the exact BTB session/authentication transport is verified.

1. BLE advertisement capture.
2. Direct LE/GATT connection.
3. Service/characteristic inventory.
4. Passive standard CCCD subscription to NOTIFY/INDICATE characteristics on the observed BTB service.
5. Record notifications, read values and timing.
6. Identify the actual Astera session/authentication framing.
7. Only after verification, implement the minimum real commands needed for DIM/CCT/BOJA/FX.

Bluetooth Classic/SPP is not part of the automatic Astera connect path. It may remain available as a diagnostic tool only.

## Removed network transports

DMX / Art-Net / sACN / CRMX are not CONTROL transports in this branch. Their executable JavaScript, Android bridge methods, sender classes and protocol tests have been removed.

Fixture catalog entries may still describe manufacturer-supported DMX or CRMX capability as reference metadata. That metadata cannot create a CONTROL route, unlock a quick control or cause LightingAI to transmit a command.

## Release rule

PR #408 remains draft and MAIN remains untouched until the required Bluetooth vendor path is genuinely functional and physically tested.

No final APK is released merely because BLE discovery or GATT diagnostics work.
