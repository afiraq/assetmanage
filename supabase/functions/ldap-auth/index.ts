import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LdapAuthRequest {
  action: 'test' | 'authenticate' | 'search';
  serverUrl: string;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
  userFilter?: string;
  // For authentication
  username?: string;
  password?: string;
}

// Simple LDAP message encoder for bind operation
function encodeLdapBind(messageId: number, bindDn: string, password: string): Uint8Array {
  const bindDnBytes = new TextEncoder().encode(bindDn);
  const passwordBytes = new TextEncoder().encode(password);
  
  // Build bind request
  const bindRequest: number[] = [];
  
  // Version (INTEGER 3)
  bindRequest.push(0x02, 0x01, 0x03);
  
  // Name (OCTET STRING)
  bindRequest.push(0x04);
  if (bindDnBytes.length < 128) {
    bindRequest.push(bindDnBytes.length);
  } else {
    bindRequest.push(0x81, bindDnBytes.length);
  }
  bindRequest.push(...bindDnBytes);
  
  // Simple authentication (context-specific [0])
  bindRequest.push(0x80);
  if (passwordBytes.length < 128) {
    bindRequest.push(passwordBytes.length);
  } else {
    bindRequest.push(0x81, passwordBytes.length);
  }
  bindRequest.push(...passwordBytes);
  
  // Wrap in BindRequest (APPLICATION 0)
  const bindRequestWrapped: number[] = [0x60];
  if (bindRequest.length < 128) {
    bindRequestWrapped.push(bindRequest.length);
  } else {
    bindRequestWrapped.push(0x81, bindRequest.length);
  }
  bindRequestWrapped.push(...bindRequest);
  
  // Message ID (INTEGER)
  const messageIdBytes: number[] = [0x02, 0x01, messageId];
  
  // Build complete message
  const message: number[] = [...messageIdBytes, ...bindRequestWrapped];
  
  // Wrap in SEQUENCE
  const sequence: number[] = [0x30];
  if (message.length < 128) {
    sequence.push(message.length);
  } else {
    sequence.push(0x81, message.length);
  }
  sequence.push(...message);
  
  return new Uint8Array(sequence);
}

// Parse LDAP bind response
function parseLdapBindResponse(data: Uint8Array): { success: boolean; message: string } {
  try {
    // Basic parsing - look for result code
    // Result code 0 = success
    if (data.length > 10) {
      // Find the result code in the response
      // The structure is: SEQUENCE -> messageId -> BindResponse -> resultCode
      for (let i = 0; i < data.length - 3; i++) {
        // Look for BindResponse tag (0x61) followed by length and then resultCode
        if (data[i] === 0x61) {
          // Skip to result code (after length bytes)
          let j = i + 1;
          // Handle length encoding
          if (data[j] & 0x80) {
            j += (data[j] & 0x7f) + 1;
          } else {
            j += 1;
          }
          // Now we should be at resultCode (ENUMERATED)
          if (data[j] === 0x0a && data[j + 1] === 0x01) {
            const resultCode = data[j + 2];
            if (resultCode === 0) {
              return { success: true, message: "Bind successful" };
            } else {
              const errorMessages: Record<number, string> = {
                1: "Operations error",
                2: "Protocol error",
                7: "Authentication method not supported",
                8: "Strong auth required",
                32: "No such object",
                48: "Inappropriate authentication",
                49: "Invalid credentials",
                50: "Insufficient access rights",
                52: "Unavailable",
                53: "Unwilling to perform",
              };
              return { 
                success: false, 
                message: errorMessages[resultCode] || `LDAP error code: ${resultCode}` 
              };
            }
          }
        }
      }
    }
    return { success: false, message: "Unable to parse LDAP response" };
  } catch (err) {
    const error = err as Error;
    return { success: false, message: `Parse error: ${error.message}` };
  }
}

async function testLdapConnection(config: LdapAuthRequest): Promise<{ success: boolean; message: string }> {
  console.log(`Testing LDAP connection to ${config.serverUrl}`);
  
  try {
    // Parse server URL
    const urlMatch = config.serverUrl.match(/^ldaps?:\/\/([^:\/]+)(?::(\d+))?/i);
    if (!urlMatch) {
      return { success: false, message: "Invalid LDAP server URL format. Use ldap://hostname:port or ldaps://hostname:port" };
    }
    
    const hostname = urlMatch[1];
    const isSecure = config.serverUrl.toLowerCase().startsWith('ldaps');
    const port = parseInt(urlMatch[2] || (isSecure ? '636' : '389'));
    
    console.log(`Connecting to ${hostname}:${port} (secure: ${isSecure})`);
    
    // Connect to LDAP server
    let conn: Deno.TcpConn | Deno.TlsConn;
    
    if (isSecure) {
      conn = await Deno.connectTls({
        hostname,
        port,
      });
    } else {
      conn = await Deno.connect({
        hostname,
        port,
      });
    }
    
    console.log("TCP connection established, sending bind request...");
    
    // Send bind request
    const bindRequest = encodeLdapBind(1, config.bindDn, config.bindPassword);
    await conn.write(bindRequest);
    
    // Read response
    const buffer = new Uint8Array(4096);
    const bytesRead = await conn.read(buffer);
    
    conn.close();
    
    if (bytesRead === null || bytesRead === 0) {
      return { success: false, message: "No response from LDAP server" };
    }
    
    const response = buffer.slice(0, bytesRead);
    console.log(`Received ${bytesRead} bytes from server`);
    
    return parseLdapBindResponse(response);
    
  } catch (err) {
    const error = err as Error;
    console.error("LDAP connection error:", error);
    
    if (error.message?.includes("Connection refused")) {
      return { success: false, message: "Connection refused. Check if the LDAP server is running and accessible." };
    }
    if (error.message?.includes("dns")) {
      return { success: false, message: "DNS resolution failed. Check the server hostname." };
    }
    if (error.message?.includes("tls") || error.message?.includes("certificate")) {
      return { success: false, message: "TLS/SSL error. Check certificate configuration." };
    }
    
    return { success: false, message: `Connection error: ${error.message}` };
  }
}

async function authenticateUser(config: LdapAuthRequest): Promise<{ success: boolean; message: string; user?: { username: string; dn: string } }> {
  console.log(`Authenticating user ${config.username}`);
  
  if (!config.username || !config.password) {
    return { success: false, message: "Username and password are required" };
  }
  
  try {
    // First, bind with service account to search for user
    const serviceBindResult = await testLdapConnection(config);
    if (!serviceBindResult.success) {
      return { success: false, message: `Service account bind failed: ${serviceBindResult.message}` };
    }
    
    // Construct user DN based on filter pattern
    // Common patterns: CN=username,... or uid=username,...
    const userFilter = config.userFilter || "(sAMAccountName={username})";
    const userDn = userFilter.includes("sAMAccountName") 
      ? `CN=${config.username},${config.baseDn}`
      : `uid=${config.username},${config.baseDn}`;
    
    console.log(`Attempting user bind with DN: ${userDn}`);
    
    // Now try to bind as the user
    const userBindConfig = {
      ...config,
      bindDn: userDn,
      bindPassword: config.password,
    };
    
    const userBindResult = await testLdapConnection(userBindConfig);
    
    if (userBindResult.success) {
      return {
        success: true,
        message: "Authentication successful",
        user: {
          username: config.username,
          dn: userDn,
        }
      };
    }
    
    return { success: false, message: userBindResult.message };
    
  } catch (err) {
    const error = err as Error;
    console.error("Authentication error:", error);
    return { success: false, message: `Authentication error: ${error.message}` };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LdapAuthRequest = await req.json();
    console.log(`LDAP request: action=${body.action}`);
    
    // Validate required fields
    if (!body.serverUrl || !body.baseDn) {
      return new Response(
        JSON.stringify({ success: false, message: "Server URL and Base DN are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let result;
    
    switch (body.action) {
      case 'test':
        if (!body.bindDn || !body.bindPassword) {
          return new Response(
            JSON.stringify({ success: false, message: "Bind DN and password are required for connection test" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await testLdapConnection(body);
        break;
        
      case 'authenticate':
        result = await authenticateUser(body);
        break;
        
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Invalid action. Use 'test' or 'authenticate'" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    console.log(`LDAP result: ${JSON.stringify(result)}`);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (err) {
    const error = err as Error;
    console.error('Error in ldap-auth function:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
