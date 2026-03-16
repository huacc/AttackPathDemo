export interface NetworkService {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  version: string;
  banner?: string;
  state: 'open' | 'filtered' | 'closed';
}

export interface NetworkNode {
  nodeId: string;
  name: string;
  nodeType: 'hardware' | 'software';
  deviceCategory:
    | 'server'
    | 'router'
    | 'switch'
    | 'firewall'
    | 'load_balancer'
    | 'endpoint'
    | 'iot_device'
    | 'web_application'
    | 'database'
    | 'middleware'
    | 'container'
    | 'api_gateway'
    | 'domain_controller';
  cpe?: string;
  zone: 'external' | 'dmz' | 'intranet' | 'cloud';
  ipv4Address?: string;
  ipv6Address?: string;
  macAddress?: string;
  hostname?: string;
  vlanId?: number;
  asn?: number;
  openPorts?: NetworkService[];
  osType?: 'windows' | 'linux' | 'macos' | 'ios' | 'android' | 'embedded';
  osVersion?: string;
  osCpe?: string;
  kernelVersion?: string;
  architecture?: 'x86_64' | 'arm64' | 'mips' | 'ppc';
  patchLevel?: 'up_to_date' | 'outdated' | 'eol' | 'unknown';
  lastPatchDate?: string;
  attackSurface?: number;
  exploitabilityScore?: number;
  criticalityLevel?: 'critical' | 'high' | 'medium' | 'low';
  dataClassification?: 'top_secret' | 'secret' | 'confidential' | 'public';
  complianceStatus?: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  securityScore?: number;
  status?: 'online' | 'offline' | 'degraded' | 'compromised';
  compromiseIndicators?: string[];
  lastSeenAt?: string;
}

export const NETWORK_NODES: NetworkNode[] = [
  {
    nodeId: 'node-ext-01',
    name: 'internet-gateway',
    nodeType: 'hardware',
    deviceCategory: 'router',
    zone: 'external',
    ipv4Address: '203.0.113.1/24',
    hostname: 'edge-router.isp.net',
    asn: 64512,
    openPorts: [
      { port: 179, protocol: 'tcp', service: 'bgp', version: 'BIRD 2.0', state: 'open' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/8.9', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Debian 12',
    osCpe: 'cpe:2.3:o:debian:debian_linux:12:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 28,
    exploitabilityScore: 3.1,
    criticalityLevel: 'high',
    securityScore: 78,
    status: 'online'
  },
  {
    nodeId: 'node-ext-02',
    name: 'attacker-node',
    nodeType: 'hardware',
    deviceCategory: 'endpoint',
    zone: 'external',
    ipv4Address: '198.51.100.23/24',
    hostname: 'kali-attacker',
    openPorts: [
      { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.20.2', state: 'open' },
      { port: 53, protocol: 'udp', service: 'dns', version: 'dnsmasq/2.86', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Kali 2024.4',
    osCpe: 'cpe:2.3:o:kalilinux:kali_linux:2024.4:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 22,
    exploitabilityScore: 2.8,
    criticalityLevel: 'medium',
    securityScore: 82,
    status: 'online'
  },
  {
    nodeId: 'node-ext-03',
    name: 'public-dns',
    nodeType: 'software',
    deviceCategory: 'server',
    zone: 'external',
    ipv4Address: '203.0.113.53/24',
    hostname: 'dns.corp.example',
    openPorts: [
      { port: 53, protocol: 'udp', service: 'dns', version: 'BIND 9.18.24', state: 'open' },
      { port: 53, protocol: 'tcp', service: 'dns', version: 'BIND 9.18.24', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.4 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 30,
    exploitabilityScore: 4.2,
    criticalityLevel: 'medium',
    securityScore: 74,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-01',
    name: 'edge-firewall',
    nodeType: 'hardware',
    deviceCategory: 'firewall',
    zone: 'dmz',
    ipv4Address: '192.168.10.1/24',
    hostname: 'fw-edge-01',
    openPorts: [
      { port: 443, protocol: 'tcp', service: 'https', version: 'PAN-OS 11.0', state: 'open' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/8.4', state: 'open' }
    ],
    osType: 'embedded',
    osVersion: 'PAN-OS 11.0',
    osCpe: 'cpe:2.3:o:paloaltonetworks:pan-os:11.0:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 18,
    exploitabilityScore: 2.5,
    criticalityLevel: 'critical',
    securityScore: 90,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-02',
    name: 'waf-01',
    nodeType: 'software',
    deviceCategory: 'middleware',
    zone: 'dmz',
    ipv4Address: '192.168.10.5/24',
    hostname: 'waf.corp.local',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', version: 'nginx/1.22.1', state: 'open' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.22.1', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'CentOS 8',
    osCpe: 'cpe:2.3:o:centos:centos:8:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 36,
    exploitabilityScore: 5.6,
    criticalityLevel: 'high',
    securityScore: 68,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-03',
    name: 'web-portal-01',
    nodeType: 'software',
    deviceCategory: 'web_application',
    zone: 'dmz',
    ipv4Address: '192.168.10.10/24',
    hostname: 'portal.corp.local',
    cpe: 'cpe:2.3:a:nginx:nginx:1.18.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', version: 'nginx/1.18.0', state: 'open' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.18.0', state: 'open' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/8.2', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 20.04.6 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:20.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 70,
    exploitabilityScore: 8.3,
    criticalityLevel: 'high',
    securityScore: 38,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-04',
    name: 'api-gateway-01',
    nodeType: 'software',
    deviceCategory: 'api_gateway',
    zone: 'dmz',
    ipv4Address: '192.168.10.12/24',
    hostname: 'api-gw.corp.local',
    cpe: 'cpe:2.3:a:konghq:kong:3.5.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 8000, protocol: 'tcp', service: 'http', version: 'kong/3.5.0', state: 'open' },
      { port: 8443, protocol: 'tcp', service: 'https', version: 'kong/3.5.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 62,
    exploitabilityScore: 7.1,
    criticalityLevel: 'high',
    securityScore: 45,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-05',
    name: 'bastion-01',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'dmz',
    ipv4Address: '192.168.10.20/24',
    hostname: 'bastion.corp.local',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/9.0', state: 'open' },
      { port: 3389, protocol: 'tcp', service: 'rdp', version: 'xrdp/0.9.20', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Rocky Linux 9.3',
    osCpe: 'cpe:2.3:o:rocky:rocky_linux:9.3:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 44,
    exploitabilityScore: 5.2,
    criticalityLevel: 'critical',
    securityScore: 72,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-06',
    name: 'mail-relay-01',
    nodeType: 'software',
    deviceCategory: 'server',
    zone: 'dmz',
    ipv4Address: '192.168.10.25/24',
    hostname: 'mail.corp.local',
    cpe: 'cpe:2.3:a:postfix:postfix:3.7.4:*:*:*:*:*:*:*',
    openPorts: [
      { port: 25, protocol: 'tcp', service: 'smtp', version: 'postfix/3.7.4', state: 'open' },
      { port: 587, protocol: 'tcp', service: 'smtp', version: 'postfix/3.7.4', state: 'open' },
      { port: 993, protocol: 'tcp', service: 'imaps', version: 'dovecot/2.3.20', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Debian 11',
    osCpe: 'cpe:2.3:o:debian:debian_linux:11:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 58,
    exploitabilityScore: 6.4,
    criticalityLevel: 'medium',
    securityScore: 55,
    status: 'online'
  },
  {
    nodeId: 'node-dmz-07',
    name: 'vpn-gateway',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'dmz',
    ipv4Address: '192.168.10.30/24',
    hostname: 'vpn.corp.local',
    cpe: 'cpe:2.3:a:openvpn:openvpn:2.6.8:*:*:*:*:*:*:*',
    openPorts: [
      { port: 1194, protocol: 'udp', service: 'openvpn', version: 'openvpn/2.6.8', state: 'open' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.22.1', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 64,
    exploitabilityScore: 7.0,
    criticalityLevel: 'high',
    securityScore: 49,
    status: 'online'
  },
  {
    nodeId: 'node-intra-01',
    name: 'core-switch-01',
    nodeType: 'hardware',
    deviceCategory: 'switch',
    zone: 'intranet',
    ipv4Address: '192.168.20.2/24',
    hostname: 'core-sw.corp.local',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'Cisco-SSH/1.25', state: 'open' },
      { port: 161, protocol: 'udp', service: 'snmp', version: 'SNMPv2', state: 'open' }
    ],
    osType: 'embedded',
    osVersion: 'Cisco IOS XE 17.9',
    osCpe: 'cpe:2.3:o:cisco:ios_xe:17.9:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 26,
    exploitabilityScore: 3.0,
    criticalityLevel: 'high',
    securityScore: 80,
    status: 'online'
  },
  {
    nodeId: 'node-intra-02',
    name: 'internal-firewall',
    nodeType: 'hardware',
    deviceCategory: 'firewall',
    zone: 'intranet',
    ipv4Address: '192.168.20.1/24',
    hostname: 'fw-core-01',
    openPorts: [
      { port: 443, protocol: 'tcp', service: 'https', version: 'FortiOS 7.2', state: 'open' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/8.4', state: 'open' }
    ],
    osType: 'embedded',
    osVersion: 'FortiOS 7.2',
    osCpe: 'cpe:2.3:o:fortinet:fortios:7.2:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 20,
    exploitabilityScore: 2.2,
    criticalityLevel: 'critical',
    securityScore: 88,
    status: 'online'
  },
  {
    nodeId: 'node-intra-03',
    name: 'ad-dc-01',
    nodeType: 'hardware',
    deviceCategory: 'domain_controller',
    zone: 'intranet',
    ipv4Address: '192.168.20.10/24',
    hostname: 'dc01.corp.local',
    cpe: 'cpe:2.3:o:microsoft:windows_server_2019:10.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 389, protocol: 'tcp', service: 'ldap', version: 'Active Directory', state: 'open' },
      { port: 636, protocol: 'tcp', service: 'ldaps', version: 'Active Directory', state: 'open' },
      { port: 445, protocol: 'tcp', service: 'smb', version: 'SMB 3.1.1', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows Server 2019',
    osCpe: 'cpe:2.3:o:microsoft:windows_server_2019:10.0:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 66,
    exploitabilityScore: 7.8,
    criticalityLevel: 'critical',
    securityScore: 42,
    status: 'online'
  },
  {
    nodeId: 'node-intra-04',
    name: 'file-server-01',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.20/24',
    hostname: 'filesrv.corp.local',
    cpe: 'cpe:2.3:o:microsoft:windows_server_2016:10.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 445, protocol: 'tcp', service: 'smb', version: 'SMB 3.0', state: 'open' },
      { port: 5985, protocol: 'tcp', service: 'winrm', version: 'WinRM', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows Server 2016',
    osCpe: 'cpe:2.3:o:microsoft:windows_server_2016:10.0:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 60,
    exploitabilityScore: 6.9,
    criticalityLevel: 'high',
    securityScore: 50,
    status: 'online'
  },
  {
    nodeId: 'node-intra-05',
    name: 'db-core-01',
    nodeType: 'software',
    deviceCategory: 'database',
    zone: 'intranet',
    ipv4Address: '192.168.20.30/24',
    hostname: 'db01.corp.local',
    cpe: 'cpe:2.3:a:mysql:mysql:8.0.33:*:*:*:*:*:*:*',
    openPorts: [
      { port: 3306, protocol: 'tcp', service: 'mysql', version: 'mysql/8.0.33', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 52,
    exploitabilityScore: 6.2,
    criticalityLevel: 'critical',
    securityScore: 46,
    status: 'online'
  },
  {
    nodeId: 'node-intra-06',
    name: 'app-server-01',
    nodeType: 'software',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.40/24',
    hostname: 'app01.corp.local',
    cpe: 'cpe:2.3:a:apache:tomcat:9.0.80:*:*:*:*:*:*:*',
    openPorts: [
      { port: 8080, protocol: 'tcp', service: 'http', version: 'tomcat/9.0.80', state: 'open' },
      { port: 8009, protocol: 'tcp', service: 'ajp', version: 'tomcat/9.0.80', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.2 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 58,
    exploitabilityScore: 6.7,
    criticalityLevel: 'high',
    securityScore: 48,
    status: 'online'
  },
  {
    nodeId: 'node-intra-07',
    name: 'redis-cache-01',
    nodeType: 'software',
    deviceCategory: 'middleware',
    zone: 'intranet',
    ipv4Address: '192.168.20.41/24',
    hostname: 'redis.corp.local',
    cpe: 'cpe:2.3:a:redis:redis:6.2.14:*:*:*:*:*:*:*',
    openPorts: [
      { port: 6379, protocol: 'tcp', service: 'redis', version: 'redis/6.2.14', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 20.04.6 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:20.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 54,
    exploitabilityScore: 6.1,
    criticalityLevel: 'medium',
    securityScore: 52,
    status: 'online'
  },
  {
    nodeId: 'node-intra-08',
    name: 'siem-01',
    nodeType: 'software',
    deviceCategory: 'middleware',
    zone: 'intranet',
    ipv4Address: '192.168.20.50/24',
    hostname: 'siem.corp.local',
    cpe: 'cpe:2.3:a:elastic:elasticsearch:8.9.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 9200, protocol: 'tcp', service: 'http', version: 'elasticsearch/8.9.0', state: 'open' },
      { port: 5601, protocol: 'tcp', service: 'kibana', version: 'kibana/8.9.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 40,
    exploitabilityScore: 4.5,
    criticalityLevel: 'high',
    securityScore: 70,
    status: 'online'
  },
  {
    nodeId: 'node-intra-09',
    name: 'backup-server-01',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.60/24',
    hostname: 'backup.corp.local',
    cpe: 'cpe:2.3:a:veeam:backup_\u0026_replication:12.1:*:*:*:*:*:*:*',
    openPorts: [
      { port: 9392, protocol: 'tcp', service: 'https', version: 'veeam/12.1', state: 'open' },
      { port: 6160, protocol: 'tcp', service: 'veeam', version: 'veeam/12.1', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows Server 2022',
    osCpe: 'cpe:2.3:o:microsoft:windows_server_2022:10.0:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 38,
    exploitabilityScore: 4.0,
    criticalityLevel: 'high',
    securityScore: 76,
    status: 'online'
  },
  {
    nodeId: 'node-intra-10',
    name: 'workstation-01',
    nodeType: 'hardware',
    deviceCategory: 'endpoint',
    zone: 'intranet',
    ipv4Address: '192.168.20.101/24',
    hostname: 'ws-01.corp.local',
    openPorts: [
      { port: 3389, protocol: 'tcp', service: 'rdp', version: 'rdp/10.0', state: 'open' },
      { port: 5985, protocol: 'tcp', service: 'winrm', version: 'WinRM', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows 10 22H2',
    osCpe: 'cpe:2.3:o:microsoft:windows_10:10.0:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 55,
    exploitabilityScore: 6.0,
    criticalityLevel: 'medium',
    securityScore: 58,
    status: 'online'
  },
  {
    nodeId: 'node-intra-11',
    name: 'workstation-02',
    nodeType: 'hardware',
    deviceCategory: 'endpoint',
    zone: 'intranet',
    ipv4Address: '192.168.20.102/24',
    hostname: 'ws-02.corp.local',
    openPorts: [
      { port: 3389, protocol: 'tcp', service: 'rdp', version: 'rdp/10.0', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows 11 23H2',
    osCpe: 'cpe:2.3:o:microsoft:windows_11:10.0:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 32,
    exploitabilityScore: 3.6,
    criticalityLevel: 'medium',
    securityScore: 74,
    status: 'online'
  },
  {
    nodeId: 'node-intra-12',
    name: 'devops-runner-01',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.110/24',
    hostname: 'ci-runner.corp.local',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/9.1', state: 'open' },
      { port: 2376, protocol: 'tcp', service: 'docker', version: 'docker/24.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 61,
    exploitabilityScore: 7.4,
    criticalityLevel: 'high',
    securityScore: 47,
    status: 'online'
  },
  {
    nodeId: 'node-intra-13',
    name: 'gitlab-01',
    nodeType: 'software',
    deviceCategory: 'web_application',
    zone: 'intranet',
    ipv4Address: '192.168.20.120/24',
    hostname: 'gitlab.corp.local',
    cpe: 'cpe:2.3:a:gitlab:gitlab:16.8.2:*:*:*:*:*:*:*',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', version: 'nginx/1.22.1', state: 'open' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.22.1', state: 'open' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/8.4', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 67,
    exploitabilityScore: 7.6,
    criticalityLevel: 'high',
    securityScore: 44,
    status: 'online'
  },
  {
    nodeId: 'node-intra-14',
    name: 'file-nas-01',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.130/24',
    hostname: 'nas.corp.local',
    cpe: 'cpe:2.3:o:synology:diskstation_manager:7.2:*:*:*:*:*:*:*',
    openPorts: [
      { port: 5000, protocol: 'tcp', service: 'http', version: 'synology/7.2', state: 'open' },
      { port: 5001, protocol: 'tcp', service: 'https', version: 'synology/7.2', state: 'open' },
      { port: 445, protocol: 'tcp', service: 'smb', version: 'SMB 3.0', state: 'open' }
    ],
    osType: 'embedded',
    osVersion: 'Synology DSM 7.2',
    osCpe: 'cpe:2.3:o:synology:diskstation_manager:7.2:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 59,
    exploitabilityScore: 6.8,
    criticalityLevel: 'high',
    securityScore: 50,
    status: 'online'
  },
  {
    nodeId: 'node-intra-15',
    name: 'hr-workstation-01',
    nodeType: 'hardware',
    deviceCategory: 'endpoint',
    zone: 'intranet',
    ipv4Address: '192.168.20.150/24',
    hostname: 'hr-ws-01.corp.local',
    openPorts: [
      { port: 3389, protocol: 'tcp', service: 'rdp', version: 'rdp/10.0', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows 10 21H2',
    osCpe: 'cpe:2.3:o:microsoft:windows_10:10.0:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 50,
    exploitabilityScore: 5.8,
    criticalityLevel: 'medium',
    securityScore: 57,
    status: 'online'
  },
  {
    nodeId: 'node-intra-16',
    name: 'vdi-broker-01',
    nodeType: 'software',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.160/24',
    hostname: 'vdi-broker.corp.local',
    cpe: 'cpe:2.3:a:vmware:horizon:8.10:*:*:*:*:*:*:*',
    openPorts: [
      { port: 443, protocol: 'tcp', service: 'https', version: 'vmware-horizon/8.10', state: 'open' },
      { port: 4172, protocol: 'tcp', service: 'pc-over-ip', version: 'pcip/1.0', state: 'open' }
    ],
    osType: 'windows',
    osVersion: 'Windows Server 2019',
    osCpe: 'cpe:2.3:o:microsoft:windows_server_2019:10.0:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 48,
    exploitabilityScore: 5.5,
    criticalityLevel: 'high',
    securityScore: 60,
    status: 'online'
  },
  {
    nodeId: 'node-intra-17',
    name: 'container-host-01',
    nodeType: 'hardware',
    deviceCategory: 'container',
    zone: 'intranet',
    ipv4Address: '192.168.20.170/24',
    hostname: 'k8s-node-01.corp.local',
    openPorts: [
      { port: 10250, protocol: 'tcp', service: 'kubelet', version: 'k8s/1.28', state: 'open' },
      { port: 6443, protocol: 'tcp', service: 'kube-apiserver', version: 'k8s/1.28', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 63,
    exploitabilityScore: 7.2,
    criticalityLevel: 'high',
    securityScore: 46,
    status: 'online'
  },
  {
    nodeId: 'node-intra-18',
    name: 'kafka-broker-01',
    nodeType: 'software',
    deviceCategory: 'middleware',
    zone: 'intranet',
    ipv4Address: '192.168.20.180/24',
    hostname: 'kafka.corp.local',
    cpe: 'cpe:2.3:a:apache:kafka:3.6.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 9092, protocol: 'tcp', service: 'kafka', version: 'kafka/3.6.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 49,
    exploitabilityScore: 5.9,
    criticalityLevel: 'medium',
    securityScore: 56,
    status: 'online'
  },
  {
    nodeId: 'node-intra-19',
    name: 'iot-gateway-01',
    nodeType: 'hardware',
    deviceCategory: 'iot_device',
    zone: 'intranet',
    ipv4Address: '192.168.20.200/24',
    hostname: 'iot-gw.corp.local',
    openPorts: [
      { port: 1883, protocol: 'tcp', service: 'mqtt', version: 'mosquitto/2.0', state: 'open' },
      { port: 5683, protocol: 'udp', service: 'coap', version: 'libcoap/4.3', state: 'open' }
    ],
    osType: 'embedded',
    osVersion: 'OpenWrt 23.05',
    osCpe: 'cpe:2.3:o:openwrt:openwrt:23.05:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 45,
    exploitabilityScore: 5.1,
    criticalityLevel: 'medium',
    securityScore: 61,
    status: 'online'
  },
  {
    nodeId: 'node-intra-20',
    name: 'erp-app-01',
    nodeType: 'software',
    deviceCategory: 'web_application',
    zone: 'intranet',
    ipv4Address: '192.168.20.210/24',
    hostname: 'erp.corp.local',
    cpe: 'cpe:2.3:a:odoo:odoo:16.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 8069, protocol: 'tcp', service: 'http', version: 'odoo/16.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 57,
    exploitabilityScore: 6.6,
    criticalityLevel: 'high',
    securityScore: 47,
    status: 'online'
  },
  {
    nodeId: 'node-intra-21',
    name: 'hr-db-01',
    nodeType: 'software',
    deviceCategory: 'database',
    zone: 'intranet',
    ipv4Address: '192.168.20.211/24',
    hostname: 'hrdb.corp.local',
    cpe: 'cpe:2.3:a:postgresql:postgresql:14.9:*:*:*:*:*:*:*',
    openPorts: [
      { port: 5432, protocol: 'tcp', service: 'postgres', version: 'postgres/14.9', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 51,
    exploitabilityScore: 6.0,
    criticalityLevel: 'high',
    securityScore: 49,
    status: 'online'
  },
  {
    nodeId: 'node-intra-22',
    name: 'monitoring-01',
    nodeType: 'software',
    deviceCategory: 'middleware',
    zone: 'intranet',
    ipv4Address: '192.168.20.220/24',
    hostname: 'prometheus.corp.local',
    cpe: 'cpe:2.3:a:prometheus:prometheus:2.48.0:*:*:*:*:*:*:*',
    openPorts: [
      { port: 9090, protocol: 'tcp', service: 'prometheus', version: 'prometheus/2.48.0', state: 'open' },
      { port: 3000, protocol: 'tcp', service: 'grafana', version: 'grafana/10.2.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 41,
    exploitabilityScore: 4.7,
    criticalityLevel: 'medium',
    securityScore: 72,
    status: 'online'
  },
  {
    nodeId: 'node-intra-23',
    name: 'dns-internal-01',
    nodeType: 'software',
    deviceCategory: 'server',
    zone: 'intranet',
    ipv4Address: '192.168.20.230/24',
    hostname: 'dns-int.corp.local',
    cpe: 'cpe:2.3:a:isc:bind:9.18.24:*:*:*:*:*:*:*',
    openPorts: [
      { port: 53, protocol: 'udp', service: 'dns', version: 'bind/9.18.24', state: 'open' },
      { port: 53, protocol: 'tcp', service: 'dns', version: 'bind/9.18.24', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 34,
    exploitabilityScore: 3.8,
    criticalityLevel: 'medium',
    securityScore: 75,
    status: 'online'
  },
  {
    nodeId: 'node-intra-24',
    name: 'jump-host-01',
    nodeType: 'hardware',
    deviceCategory: 'endpoint',
    zone: 'intranet',
    ipv4Address: '192.168.20.240/24',
    hostname: 'jump.corp.local',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/9.1', state: 'open' },
      { port: 3389, protocol: 'tcp', service: 'rdp', version: 'rdp/10.0', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.2 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 33,
    exploitabilityScore: 3.7,
    criticalityLevel: 'medium',
    securityScore: 73,
    status: 'online'
  },
  {
    nodeId: 'node-intra-25',
    name: 'cloud-bastion-01',
    nodeType: 'hardware',
    deviceCategory: 'server',
    zone: 'cloud',
    ipv4Address: '10.10.10.10/24',
    hostname: 'bastion.cloud.local',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH/8.9', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Ubuntu 22.04.3 LTS',
    osCpe: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 24,
    exploitabilityScore: 2.9,
    criticalityLevel: 'high',
    securityScore: 79,
    status: 'online'
  },
  {
    nodeId: 'node-intra-26',
    name: 'cloud-db-01',
    nodeType: 'software',
    deviceCategory: 'database',
    zone: 'cloud',
    ipv4Address: '10.10.10.20/24',
    hostname: 'clouddb.corp.local',
    cpe: 'cpe:2.3:a:amazon:aurora_mysql:3.04:*:*:*:*:*:*:*',
    openPorts: [
      { port: 3306, protocol: 'tcp', service: 'mysql', version: 'aurora-mysql/3.04', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Amazon Linux 2023',
    osCpe: 'cpe:2.3:o:amazon:amazon_linux:2023:*:*:*:*:*:*:*',
    patchLevel: 'up_to_date',
    attackSurface: 40,
    exploitabilityScore: 4.3,
    criticalityLevel: 'critical',
    securityScore: 71,
    status: 'online'
  },
  {
    nodeId: 'node-intra-27',
    name: 'cloud-app-01',
    nodeType: 'software',
    deviceCategory: 'web_application',
    zone: 'cloud',
    ipv4Address: '10.10.10.30/24',
    hostname: 'cloud-app.corp.local',
    cpe: 'cpe:2.3:a:apache:http_server:2.4.58:*:*:*:*:*:*:*',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', version: 'apache/2.4.58', state: 'open' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'apache/2.4.58', state: 'open' }
    ],
    osType: 'linux',
    osVersion: 'Amazon Linux 2023',
    osCpe: 'cpe:2.3:o:amazon:amazon_linux:2023:*:*:*:*:*:*:*',
    patchLevel: 'outdated',
    attackSurface: 55,
    exploitabilityScore: 6.3,
    criticalityLevel: 'high',
    securityScore: 52,
    status: 'online'
  },
  {
    nodeId: 'node-intra-28',
    name: 'cloud-lb-01',
    nodeType: 'hardware',
    deviceCategory: 'load_balancer',
    zone: 'cloud',
    ipv4Address: '10.10.10.5/24',
    hostname: 'elb.cloud.local',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', version: 'aws-elb', state: 'open' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'aws-elb', state: 'open' }
    ],
    osType: 'embedded',
    osVersion: 'AWS ELB',
    patchLevel: 'up_to_date',
    attackSurface: 20,
    exploitabilityScore: 2.4,
    criticalityLevel: 'high',
    securityScore: 83,
    status: 'online'
  }
];

export default NETWORK_NODES;
export const networkNodes = NETWORK_NODES;
