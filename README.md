# Full-Stack Calculator

A responsive full-stack calculator built with React, TypeScript, Go, and a REST API.

The application supports the four basic arithmetic operations:

* Addition
* Subtraction
* Multiplication
* Division

The frontend provides a familiar calculator experience and consumes a Go REST API to perform calculations.

## Features

* Responsive calculator interface with basic mobile support
* Familiar calculator controls: digits, decimal separator, sign toggle, backspace, `CE`, `C`, and `=`
* Input validation and division-by-zero handling
* Error feedback for invalid requests, invalid API responses, and network failures
* Unit and component tests for frontend and backend
* Frontend and backend coverage reports

## Technology Stack

### Frontend

* React `19.2.7`
* TypeScript `6.0.2`
* Vite `8.1.1`
* Tailwind CSS `4.3.3`
* Vitest
* React Testing Library
* ESLint

### Backend

* Go `1.26.5`
* Go standard library:

  * `net/http`
  * `encoding/json`
  * `testing`
  * `net/http/httptest`

## Project Structure

```text
calculator-app/
├── backend/
│   ├── cmd/api/
│   └── internal/
│       ├── handler/
│       ├── model/
│       └── service/
├── frontend/
│   └── src/features/calculator/
│       ├── components/
│       ├── hooks/
│       ├── Calculator.tsx
│       ├── Calculator.test.tsx
│       ├── calculatorApi.ts
│       ├── calculatorApi.test.ts
│       ├── calculator.types.ts
│       └── calculator.utils.ts
└── README.md
```

## Prerequisites

Install the following tools before running the project:
* Go `1.26.5` or later
* Node.js `22.12.0` or later
* npm

The project was developed and validated with Node.js `24.13.0`, npm `10.8.0`, and Go `1.26.5`.

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd calculator-app
```

### Backend setup

From the repository root:

```bash
cd backend
go run ./cmd/api
```

The backend will start at:

```text
http://localhost:8080
```

### Frontend setup

Open a second terminal and run:

```bash
cd frontend
npm ci
npm run dev
```

The frontend will normally start at:

```text
http://localhost:5173
```

The Vite development server proxies requests beginning with `/api` to the Go backend at `http://localhost:8080`.

## API

### Calculate

```http
POST /api/v1/calculate
Content-Type: application/json
```

### Request body

```json
{
  "operation": "add",
  "left": 8,
  "right": 2
}
```

Supported operation values:

```text
add
subtract
multiply
divide
```

### Successful response

```json
{
  "result": 10
}
```

### Division-by-zero response

```json
{
  "error": "division by zero is not allowed"
}
```

### Unsupported-operation response

```json
{
  "error": "unsupported operation"
}
```

### Invalid-request response

```json
{
  "error": "invalid request body"
}
```

## API Examples

### Addition

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","left":8,"right":2}'
```

Expected response:

```json
{
  "result": 10
}
```

### Division by zero

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","left":10,"right":0}'
```

Expected response:

```json
{
  "error": "division by zero is not allowed"
}
```

## Testing

### Backend Tests and Coverage

The backend tests use table-driven tests and `httptest` to validate service rules and HTTP behavior.

```bash
gofmt -w .
go vet ./...
go test -count=1 ./...
go test -count=1 -cover ./...
```
#### Coverage Summary and Responsibilities

| Package | Coverage | Responsibility |
|--|--|--|
| internal/service | ✅ 100.0% | Calculator business rules |
| internal/handler | ✅ 91.7% | HTTP validation, errors, and responses |
| cmd/api | 0.0% | Application bootstrap only |
| internal/model | N/A | Data structures with no executable behavior |

The testing effort focuses on the `service` and `handler` packages, where the application's business rules, input validation, error handling, and HTTP behavior are implemented.

The `cmd/api` package contains only the application bootstrap code, while `internal/model` defines data structures without executable logic. For this reason, no artificial tests were added solely to increase their coverage.

If this project were analyzed with a tool such as SonarQube, the `cmd/api` and `internal/model` packages would be configured as coverage exclusions. They would remain included in the static code-quality analysis.

### Frontend tests and Coverage

Run the frontend test suite with coverage:

```bash
npm run test:coverage
```

The frontend tests use Vitest and React Testing Library to validate user interactions, API integration, input handling, error states, and calculator behavior.

#### Test Execution Summary

| Metric | Result | 
|--|--|
| Test files | ✅ 2/2 | 
| Tests | ✅ 31/31 |

#### Coverage Summary

| Statements | Branches | Functions | Lines |
|--|--|--|--|
| ✅ 99.21% | ✅ 93.50% | ✅ 100% | ✅ 99.20% |

The HTML coverage report is generated at:

```text
frontend/coverage/index.html
```

## Design Decisions

### Backend-first development

The backend was implemented first to define the API contract before building the user interface. Go was also the least familiar part of the stack, so starting with it surfaced technical risks earlier.

### Go project organization

The backend follows a small `cmd` and `internal` structure:

* `cmd/api` starts the HTTP server
* `internal/handler` handles HTTP concerns
* `internal/service` contains calculator rules
* `internal/model` defines request and response contracts

The `internal` directory makes it explicit that these packages belong to this application and are not intended to be imported by external modules.

### Standard library over an HTTP framework

The backend uses `net/http` instead of an external framework.

The application has one small endpoint and does not currently require authentication, middleware chains, custom routing, or other cross-cutting concerns. Adding a framework would increase dependencies and abstraction without providing meaningful value for the current scope.

### One versioned endpoint

The API exposes:

```text
POST /api/v1/calculate
```

A single endpoint is sufficient because all supported operations share the same request and response structure.

The `/v1` prefix keeps the contract explicit and leaves room for incompatible API changes without implying that a second version is currently planned.

### Stateless backend

Each API request represents one complete calculation.

The backend does not store calculator history or interaction state. The frontend manages:

* Current display value
* Stored operand
* Selected operation
* Loading state
* Error state

This keeps the API simple, predictable, and independently testable.

### Numeric representation

The backend uses `float64` because this application performs general arithmetic rather than financial calculations.

Floating-point values can contain IEEE 754 precision artifacts. To provide a cleaner calculator display, the frontend limits the displayed precision.

For financial calculations, a decimal-based representation would be more appropriate.

### Familiar calculator experience

The interface is inspired by familiar desktop calculators to reduce the learning curve.

It includes:

* `CE` to clear the current entry
* `C` to reset the full calculation
* `⌫` to remove one digit
* `±` to toggle the sign
* A comma as the visual decimal separator

### Feature-based frontend organization

Calculator-specific components, hooks, API code, types, utilities, and tests are colocated under:

```text
src/features/calculator
```

This structure keeps files that change for the same business feature close together.

Global `components`, `hooks`, or `utils` directories were intentionally avoided because the current files are not shared across multiple features.

### Native `fetch` and local state

The frontend does not use React Router, Axios, Context, or a global state library.

The application contains a single screen, and React state plus the native `fetch` API are sufficient for the current requirements.

### Vite development proxy

The frontend calls:

```text
/api/v1/calculate
```

The Vite development server proxies this path to:

```text
http://localhost:8080
```

This avoids adding local-development CORS configuration to the backend and centralizes the backend address in one place.

### Testing strategy

Backend tests use table-driven cases because they make it easy to add scenarios while keeping the test structure consistent.

Frontend component tests focus on observable user behavior instead of component implementation details. API-specific parsing and error handling are tested separately in `calculatorApi.test.ts`.

A small amount of clear test duplication was preferred over introducing premature test abstractions.

### Scope control

The optional exponentiation, square-root, percentage, Docker, persistence, and history features were intentionally not included.

The implementation prioritizes the required operations, correctness, readability, testing, and documentation over optional functionality. These optional capabilities could be added in future iterations without changing the core architecture.


## Assumptions

* Each backend request performs one binary operation.
* The API accepts JSON numbers using the standard decimal point.
* The frontend displays decimal values using a comma.
* Pressing `=` without a pending operation has no effect. Repeating `=` after a completed calculation does not repeat the previous operation.
* Calculation history does not persist between page reloads.
* The backend must be running on port `8080` when using the Vite development proxy.
* The application targets modern browsers supported by the selected frontend tooling.

## AI-Assisted Development

AI tooling was used extensively for initial code generation, test generation, refactoring suggestions, and technical explanations.

I evaluated and made the architectural decisions and trade-offs. The development process included:

* Evaluating architectural alternatives and their trade-offs
* Rejecting unnecessary abstractions
* Refactoring the frontend into cohesive components
* Validating generated code with tests, coverage, linting, formatting, static analysis, builds, and manual testing
* Revisiting decisions when the implementation became unnecessarily large or complex

<details>
<summary>Prompts used during development</summary>

The following prompts are representative examples of how AI was used during development. Generated code was reviewed, adapted, tested, and refactored, while architectural decisions and final trade-offs were evaluated independently.

1. **Go project structure**

> Help me organize the backend folders according to common Go project conventions while keeping the application simple and easy to navigate.

2. **Backend implementation**

> Generate a small Go REST API for a calculator using the standard library, with clear separation between HTTP handling, business rules, and request/response models.

3. **Numeric representation**

> How does `float64` behave with large values and decimal precision? Is it appropriate for a general calculator, and what would be different in a financial application?

4. **Backend testing**

> Generate readable table-driven unit tests for the calculator service and HTTP handler, including invalid JSON, unsupported operations, division by zero, and unsupported methods.

5. **Frontend implementation**

> Generate the React, TypeScript, Tailwind, and API integration code for a calculator with digits `0–9`, `+`, `−`, `×`, `÷`, `CE`, `C`, `±`, decimal separator, backspace, and equals.

6. **Frontend testing**

> Generate comprehensive but readable tests for the current calculator behavior, API calls, input controls and error handling.

7. **Testing-library review**

> Are `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, and `@testing-library/jest-dom` still necessary when using Vitest?

8. **Vitest versus Jest**

> Jest is widely used in React projects. Is Vitest a better choice for a Vite and TypeScript application, and why?

9. **Coverage review and Test organization**

> Some branches are still uncovered. Add concise, readable and ordered by behavior tests for those scenarios without creating artificial tests only to reach 100% coverage. 

10. **Componentization**

> `Calculator.tsx` has grown to more than 460 lines. Refactor it into cohesive React components, such as `CalculatorButton`, and a custom hook without overengineering the project.

11. **Folder organization**

> Review the frontend folder structure using patterns found in real React projects. Should calculator-specific components, hooks, and utilities remain inside the calculator feature? Shouldn't files stay inside of the feature folder to minimize search for files?

</details>