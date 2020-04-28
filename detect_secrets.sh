detect-secrets scan --no-keyword-scan > .secrets.baseline
detect-secrets audit .secrets.baseline
