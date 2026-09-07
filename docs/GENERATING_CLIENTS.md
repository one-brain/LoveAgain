# Cue Platform - Generating API Clients

## Overview

This guide explains how to auto-generate strongly-typed API clients for different platforms (C#, TypeScript) from OpenAPI specifications.

---

## Prerequisites

### Tools Required

1. **OpenAPI Generator** - Universal code generator for APIs

   ```bash
   # Install via npm
   npm install @openapitools/openapi-generator-cli -g
   
   # Or use Docker
   docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli generate ...
   ```

2. **NSwag** - OpenAPI/Swagger tooling for .NET (alternative for C#)

   ```bash
   dotnet tool install NSwag.ConsoleCore --global
   ```

3. **AutoRest** - Code generator for REST APIs (Microsoft)

   ```bash
   npm install -g @autorest/autorest
   ```

---

## Extracting OpenAPI Specifications

### Step 1: Download OpenAPI JSON

Each microservice exposes its OpenAPI spec at runtime:

```bash
# For each microservice
curl http://localhost:5001/swagger/v1/swagger.json > auth-service-swagger.json
curl http://localhost:5002/swagger/v1/swagger.json > user-service-swagger.json
curl http://localhost:5005/swagger/v1/swagger.json > booking-service-swagger.json
# ... repeat for all services
```

### Step 2: Consolidate Specifications (Optional)

For a unified API client, merge multiple specs:

```bash
# Using swagger-cli
swagger-cli bundle auth-service-swagger.json -o combined-swagger.json
```

### Step 3: Customize Specification

Edit the OpenAPI JSON to add custom metadata:

```json
{
  "info": {
    "title": "Cue Platform API",
    "version": "1.0.0",
    "description": "Unified API specification for Cue microservices",
    "contact": {
      "name": "Cue Support",
      "email": "support@cue.local"
    }
  },
  "servers": [
    {
      "url": "http://localhost:5000",
      "description": "Development API Gateway"
    }
  ]
}
```

---

## Generating C# Clients

### Using NSwag (Recommended for .NET)

#### Step 1: Install NSwag

```bash
dotnet tool install NSwag.ConsoleCore --global
```

#### Step 2: Create nswag.json Configuration

```json
{
  "runtime": "Net80",
  "documentPath": "swagger/auth-service-swagger.json",
  "outputFilePath": "Generated/AuthServiceClient.cs",
  "namespace": "Cue.ApiClients.Generated",
  "clientClassAccessModifier": "public",
  "useHttpClientCreationMethod": true,
  "httpClientType": "System.Net.Http.HttpClient",
  "generateClientClasses": true,
  "generateDtoTypes": true,
  "excludedParameterNames": [],
  "parameterDateFormat": "s",
  "jsonSerializerSettingsTransformationMethod": null,
  "dateType": "System.DateTime",
  "timeType": "System.TimeSpan",
  "timeSpanType": "System.TimeSpan",
  "arrayType": "System.Collections.Generic.ICollection",
  "arrayInstanceType": "System.Collections.ObjectModel.Collection",
  "dictionaryType": "System.Collections.Generic.IDictionary",
  "dictionaryInstanceType": "System.Collections.Generic.Dictionary",
  "arrayBaseType": "System.Collections.Generic.List",
  "classStyle": "Inpc",
  "jsonLibrary": "NewtonsoftJson",
  "useJsonSerializerApi": false,
  "generateOptionalParameters": false,
  "exposeJsonSerializerSettings": false,
  "clientBaseClass": null,
  "wrapDtoExceptions": true,
  "clientClassAccessModifier": "public",
  "generateContractResolver": false
}
```

#### Step 3: Generate Client

```bash
nswag run nswag.json
```

#### Step 4: Use Generated Client in Code

```csharp
var client = new AuthServiceClient("http://localhost:5001", httpClient);

// Register in DI
services.AddHttpClient<AuthServiceClient>(config =>
{
    config.BaseAddress = new Uri("http://localhost:5001");
});

// Usage
var response = await client.LoginAsync(new LoginRequest 
{ 
    Email = "user@example.com",
    Password = "password"
});

var token = response.Data.AccessToken;
```

---

### Using OpenAPI Generator CLI (Alternative)

#### Step 1: Install OpenAPI Generator

```bash
npm install @openapitools/openapi-generator-cli -g
```

#### Step 2: Generate C# Client

```bash
openapi-generator-cli generate \
  -i auth-service-swagger.json \
  -g csharp-netcore \
  -o Generated/CsAuthClient \
  --package-name "Cue.ApiClients.AuthService" \
  --namespace-usings "System"
```

#### Step 3: Customize Generation (Optional)

```bash
# With configuration file
openapi-generator-cli generate \
  -i auth-service-swagger.json \
  -g csharp-netcore \
  -o Generated/CsAuthClient \
  -c generator-config.json
```

generator-config.json:

```json
{
  "packageName": "Cue.ApiClients.AuthService",
  "packageVersion": "1.0.0",
  "sourceFolder": "src",
  "generateModelTests": true,
  "generateApiTests": true,
  "modelPackage": "Models",
  "apiPackage": "Apis"
}
```

---

## Generating TypeScript Clients

### Using OpenAPI Generator

#### Step 1: Generate TypeScript Client

```bash
openapi-generator-cli generate \
  -i auth-service-swagger.json \
  -g typescript-fetch \
  -o generated/typescript/auth-client \
  --package-name "@cue/auth-client" \
  --package-version "1.0.0"
```

#### Step 2: Install Generated Package

```bash
cd frontend
npm install ../generated/typescript/auth-client
```

#### Step 3: Use in React Components

```typescript
import { AuthApi, Configuration } from '@cue/auth-client';

// Configure
const config = new Configuration({
  basePath: 'http://localhost:5001',
  accessToken: localStorage.getItem('accessToken')
});

// Create API instance
const authApi = new AuthApi(config);

// Usage
async function handleLogin(email: string, password: string) {
  try {
    const response = await authApi.loginPost({
      email,
      password
    });
    
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Using AutoRest (Microsoft Alternative)

#### Step 1: Create autorest.md Configuration

```markdown
# AutoRest Configuration
> see https://aka.ms/autorest

## Inputs
input-file: ./auth-service-swagger.json

## Outputs
output-folder: ./generated/typescript
output-filename: auth-client.ts

## Code Generation
language: typescript
namespace: Cue.AuthClient
```

#### Step 2: Generate

```bash
autorest autorest.md
```

---

## Automated Client Generation Pipeline

### Using GitHub Actions

Create `.github/workflows/generate-clients.yml`:

```yaml
name: Generate API Clients

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  generate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        persist-credentials: false
        
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install OpenAPI Generator
      run: npm install -g @openapitools/openapi-generator-cli
      
    - name: Download OpenAPI Specs
      run: |
        mkdir -p specs
        curl http://localhost:5001/swagger/v1/swagger.json > specs/auth-service.json
        curl http://localhost:5002/swagger/v1/swagger.json > specs/user-service.json
        # ... repeat for all services
        
    - name: Generate C# Clients
      run: |
        dotnet tool install NSwag.ConsoleCore --global
        nswag run nswag-auth.json
        nswag run nswag-user.json
        # ... repeat for all services
        
    - name: Generate TypeScript Clients
      run: |
        openapi-generator-cli generate -i specs/auth-service.json -g typescript-fetch -o generated/typescript/auth-client
        openapi-generator-cli generate -i specs/user-service.json -g typescript-fetch -o generated/typescript/user-client
        # ... repeat for all services
        
    - name: Publish C# Clients to NuGet
      run: |
        dotnet pack Generated/AuthClient/ -c Release -o nupkg/
        dotnet nuget push nupkg/*.nupkg --api-key ${{ secrets.NUGET_API_KEY }}
        
    - name: Publish TypeScript Clients to npm
      run: |
        npm publish generated/typescript/auth-client --access public --registry https://registry.npmjs.org/
        npm publish generated/typescript/user-client --access public --registry https://registry.npmjs.org/
        
    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v5
      with:
        commit-message: "chore: update generated API clients"
        title: "Update Generated API Clients"
        body: "Auto-generated API clients from OpenAPI specifications"
        branch: "chore/update-api-clients"
```

---

## Best Practices

### 1. Version Your APIs

```json
"servers": [
  {
    "url": "http://localhost:5000/api/v1",
    "description": "v1 API"
  }
]
```

### 2. Document Response Models

```csharp
/// <summary>
/// Login response containing access token
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// JWT access token
    /// </summary>
    [JsonProperty("accessToken")]
    public string AccessToken { get; set; }
    
    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    [JsonProperty("expiresIn")]
    public int ExpiresIn { get; set; }
}
```

### 3. Use Strong Typing

```typescript
// Good - Use interfaces
interface LoginRequest {
  email: string;
  password: string;
}

// Avoid
const login = (credentials: any) => { };
```

### 4. Handle Authentication in Clients

```csharp
// C# - Set token in HttpClient
var client = new AuthServiceClient("http://localhost:5001", httpClient);
httpClient.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", accessToken);
```

```typescript
// TypeScript - Interceptor
const config = new Configuration({
  basePath: 'http://localhost:5001',
  accessToken: getStoredToken(),
  middleware: [
    {
      async pre(request: RequestContext) {
        request.headers.set('Authorization', 
          `Bearer ${getStoredToken()}`);
        return request;
      }
    }
  ]
});
```

### 5. Test Generated Clients

```csharp
[Fact]
public async Task LoginAsync_WithValidCredentials_ReturnsAccessToken()
{
    var client = new AuthServiceClient("http://localhost:5001", _httpClient);
    
    var response = await client.LoginAsync(new LoginRequest
    {
        Email = "test@example.com",
        Password = "TestPassword123!"
    });
    
    Assert.True(response.Success);
    Assert.NotNull(response.Data.AccessToken);
}
```

---

## Troubleshooting

### Issue: Generated Code Has Naming Conflicts

**Solution:** Use namespace configuration:

```bash
openapi-generator-cli generate ... \
  --namespace-usings "System.Collections.Generic" \
  --additional-properties=namingConvention=PascalCase
```

### Issue: Circular Dependencies in Models

**Solution:** Use composition patterns:

```csharp
public class User
{
    public string Id { get; set; }
    public string Name { get; set; }
    
    // Avoid circular reference - use Id only
    public string ProfileId { get; set; }
}
```

### Issue: HttpClient Not Disposing Properly

**Solution:** Register in DI container:

```csharp
services.AddHttpClient<AuthServiceClient>()
    .ConfigureHttpClient(client =>
    {
        client.BaseAddress = new Uri("http://localhost:5001");
        client.Timeout = TimeSpan.FromSeconds(30);
    });
```
