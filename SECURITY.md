# TrustCircle Security Documentation

## Security Architecture

### Cryptographic Primitives
- **Ed25519**: Digital signatures for metadata integrity
- **X25519**: Key agreement for CMK wrapping
- **AES-256-GCM**: Authenticated encryption for payloads
- **HKDF-SHA256**: Key derivation with "TCL-CMK-WRAP" label
- **SHA-256**: Location hash generation

### Key Management
- **Client-side generation**: All keys generated in browser
- **IndexedDB storage**: Persistent local storage
- **No server-side keys**: Zero-knowledge architecture
- **Nonce uniqueness**: In-memory tracking prevents reuse

### Data Flow Security

#### Capsule Creation
1. File compressed with fflate (60-80% reduction)
2. Random 32-byte CMK generated
3. File encrypted with AES-256-GCM
4. CMK wrapped for approver using X25519+HKDF
5. Metadata signed with Ed25519
6. Encrypted payload uploaded to IPFS
7. Metadata stored in Supabase

#### Capsule Unlock
1. Metadata fetched and signature verified
2. Policy conditions evaluated (date/location)
3. Encrypted payload retrieved from IPFS
4. CMK unwrapped using private key
5. Payload decrypted and decompressed
6. Status updated in database

## Security Features

### Input Validation
- Public key format and length validation
- Capsule ID UUID format validation
- File size limits (default 100MB)
- Metadata sanitization

### Network Security
- Retry logic with exponential backoff
- HTTPS-only connections
- Security headers (HSTS, CSP, X-Frame-Options)
- Geolocation permission controls

### Database Security
- Row Level Security (RLS) policies
- User context isolation
- Prepared statements (via Supabase)
- Audit trail (created_at, unlocked_at)

### Privacy Protection
- Location stored as salted hash only
- Coarse-grained precision (configurable)
- No raw coordinates in metadata
- Client-side policy evaluation

## Threat Model

### Assets
- Private keys (Ed25519, X25519)
- Capsule Master Keys (CMK)
- Decrypted file contents
- User location data

### Threats & Mitigations

**1. Key Theft**
- Threat: Attacker gains access to private keys
- Mitigation: IndexedDB encryption, no server storage
- Residual Risk: Browser compromise, malware

**2. Metadata Tampering**
- Threat: Attacker modifies capsule metadata
- Mitigation: Ed25519 signatures, version checking
- Residual Risk: None if signature verified

**3. Payload Substitution**
- Threat: Attacker replaces encrypted payload
- Mitigation: CID in signed metadata, IPFS content addressing
- Residual Risk: Low (requires breaking IPFS)

**4. Location Spoofing**
- Threat: User fakes location to unlock
- Mitigation: Salted hash, coarse precision
- Residual Risk: Medium (browser geolocation can be spoofed)

**5. Replay Attacks**
- Threat: Attacker reuses old metadata/payloads
- Mitigation: Unique nonces, timestamps, version field
- Residual Risk: Low

**6. Network Attacks**
- Threat: MITM, DNS poisoning
- Mitigation: HTTPS, HSTS, retry logic
- Residual Risk: Low with proper TLS

**7. Database Attacks**
- Threat: SQL injection, unauthorized access
- Mitigation: RLS policies, Supabase prepared statements
- Residual Risk: Low

## Security Best Practices

### For Users
1. Use strong device passwords/biometrics
2. Keep browser updated
3. Don't share private keys
4. Verify capsule metadata before unlock
5. Use trusted networks

### For Developers
1. Regular dependency updates
2. Security audit before production
3. Monitor error logs for attacks
4. Rate limit API endpoints
5. Implement CSP headers

### For Deployment
1. Enable HTTPS/HSTS
2. Configure Supabase RLS
3. Set up monitoring (Sentry)
4. Regular backups
5. Incident response plan

## Known Limitations

### Current
1. **Browser-based**: Vulnerable to XSS if compromised
2. **Location spoofing**: Browser geolocation can be faked
3. **No key recovery**: Lost keys = lost access
4. **Single device**: No multi-device sync yet
5. **Memory limits**: Large files (>100MB) may cause issues

### Future Improvements
1. Hardware security module (HSM) support
2. Multi-factor authentication
3. Key backup/recovery mechanism
4. Streaming for large files
5. Rate limiting and abuse prevention

## Compliance

### Data Protection
- **GDPR**: No PII stored, user controls data
- **CCPA**: User can delete identity/capsules
- **Privacy**: Client-side encryption, no tracking

### Cryptography
- **FIPS 140-2**: Uses approved algorithms
- **NIST**: Follows key management guidelines
- **OWASP**: Addresses top 10 vulnerabilities

## Audit Checklist

### Pre-Production
- [ ] Third-party cryptography audit
- [ ] Penetration testing
- [ ] Code review by security expert
- [ ] Dependency vulnerability scan
- [ ] Performance testing (large files)
- [ ] Browser compatibility testing
- [ ] RLS policy verification
- [ ] Error handling review

### Post-Production
- [ ] Security monitoring setup
- [ ] Incident response plan
- [ ] Regular security updates
- [ ] User security education
- [ ] Bug bounty program

## Incident Response

### Detection
- Monitor error rates
- Track failed unlock attempts
- Alert on suspicious patterns
- Log security events

### Response
1. Identify and contain
2. Assess impact
3. Notify affected users
4. Patch vulnerability
5. Post-mortem analysis

## Contact

**Security Issues**: Report to security@trustcircle.app  
**Bug Bounty**: Coming soon  
**Updates**: Check GitHub releases
