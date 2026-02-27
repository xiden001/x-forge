# Architecture

## Service Layer First
Business rules belong in service classes. Controllers should orchestrate request/response handling only.

## Dependency Boundaries
Use interfaces for external systems like payment providers, queue systems, and persistence adapters.

## Testing Conventions
Each service should expose deterministic methods that can be unit tested with mocked adapters.
