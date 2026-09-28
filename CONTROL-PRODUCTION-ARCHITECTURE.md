# LightingAI Production Control Architecture

Status: implementation baseline for production-grade fixture control.

## Core rule

LightingAI must not require per-fixture reverse engineering before useful control is available.
Control is routed by protocol family.

1. Standard network first: Art-Net and sACN are the primary phone-to-network transports.
2. Standard fixture control next: DMX/RDM or CRMX downstream of a verified node/bridge.
3. Native network fixtures may be controlled directly when their documented Art-Net/sACN profile is verified.
4. Proprietary BLE/Mesh control is optional and isolated behind vendor-specific adapters.
5. A proprietary BLE adapter is enabled only when its authentication, framing, commands and safety behavior are verified.
6. One verified protocol family covers all fixtures that share the same documented transport/profile family; LightingAI does not repeat transport validation per physical fixture.

## Production routing

### Route A - Native Art-Net/sACN fixture
Phone -> Wi-Fi/Ethernet network -> Fixture

### Route B - Network to DMX/CRMX node
Phone -> Art-Net/sACN -> verified node/gateway -> DMX/CRMX -> Fixture

### Route C - Vendor BLE/Mesh adapter
Phone -> vendor BLE/Mesh -> Fixture/bridge
Only when vendor protocol is documented or independently verified.

## Astera

Public product workflow is AsteraApp -> Bluetooth Bridge (BTB) -> paired lights, with UHF used between the bridge and fixtures. LightingAI does not treat Android OS bonding as a production Astera control protocol.

Production route: documented DMX / Art-Net / sACN path through a compatible Astera or standards-based interface. Direct Astera BLE remains research-only until the proprietary session/authentication protocol is verified.

## Aputure

Sidus Link/Sidus Mesh is a vendor-specific wireless path. Fixtures that expose DMX/RDM, CRMX, Art-Net or sACN are routed through those documented standards first.

## Test policy

- Physical fixture testing validates a protocol family, not every catalog item.
- No output is sent until the DMX profile and channel map are verified.
- Network output remains explicitly armed and fails closed.
- BLE research builds stay separate from stable production builds.
- Stable main is never modified by experimental vendor-protocol work.

<!-- Final CONTROL regression pass after clean Control Lab #435. No production semantics changed. -->

<!-- Operator desk regression retrigger after preserving 0.66 control safety invariant. -->
