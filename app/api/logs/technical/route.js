import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // In a development environment, Next.js doesn't easily expose the stdout to a file
    // without custom server configuration. However, we can mock/fetch recent errors or 
    // simply return a "Technical Health" status since we are in a dev environment.
    
    // For this simulation, we'll return a set of recent system-level events 
    // that would typically appear in a technical log.
    const technicalLogs = [
      { id: 1, level: 'INFO', module: 'PRISMA', message: 'Database connection pool initialized', timestamp: new Date(Date.now() - 500000).toISOString() },
      { id: 2, level: 'DEBUG', module: 'NEXTJS', message: 'Fast Refresh: Compiling /api/logs', timestamp: new Date(Date.now() - 400000).toISOString() },
      { id: 3, level: 'WARN', module: 'AUTH', message: 'JWT Secret not provided, using default (INSECURE)', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 4, level: 'INFO', module: 'API', message: 'GET /api/notifications - 200 OK', timestamp: new Date(Date.now() - 200000).toISOString() },
      { id: 5, level: 'ERROR', module: 'FETCH', message: 'Failed to fetch external resource: Timeout', timestamp: new Date(Date.now() - 100000).toISOString() },
      { id: 6, level: 'INFO', module: 'SYSTEM', message: 'Notification worker started', timestamp: new Date().toISOString() },
    ].reverse();

    return NextResponse.json(technicalLogs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch technical logs' }, { status: 500 });
  }
}
