# infrastructure/policies/access-rules.rego
package gateway.authz

default allow = false

# Allow access if the user's JWT contains the 'administrator' role
allow {
    input.user.role == "administrator"
    input.request.method == "GET"
}

# Block traffic attempting to hit internal Render IPs directly
deny {
    startswith(input.request.headers.host, "10.0.") 
}