import http from 'k6/http';
import { check, sleep } from 'k6';

// This configuration simulates 50 concurrent users aggressively hitting your Gateway for 30 seconds
export const options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  // Targeting the gateway health endpoint to test base efficiency
  const res = http.get('http://localhost:3000/health');
  
  // We expect 200 OK initially, but 429 (Too Many Requests) once the Rate Limiter kicks in
  check(res, {
    'is status 200': (r) => r.status === 200,
    'rate limit active (429)': (r) => r.status === 429,
  });
  
  sleep(0.1);
}