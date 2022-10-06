import type { NextApiResponse } from 'next';
import type { ServerResponse } from 'http';

type NextResponse = NextApiResponse | ServerResponse;

export default NextResponse;
