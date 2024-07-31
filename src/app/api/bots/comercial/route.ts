import BotsService from '../../../lib/bots/bots.service';
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const body = await req.json()

    console.log(body);

    const actions = BotsService.fetchComercialBot(body.contact, body.message);

    return NextResponse.json({ actions });
}