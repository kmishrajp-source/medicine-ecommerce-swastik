import { NextResponse } from 'next/server';
import { OndcProtocolService } from '@/lib/ondc-protocol';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { context, message } = payload;

    // Validate Beckn Context
    if (!context || context.action !== 'search') {
      return NextResponse.json({ error: "Invalid Beckn context or action" }, { status: 400 });
    }

    // Process the search async to immediately acknowledge the request (ONDC Protocol Requirement)
    OndcProtocolService.handleSearch(context, message.intent).catch(console.error);

    // Synchronous ACK Response
    return NextResponse.json({
      message: {
        ack: {
          status: "ACK"
        }
      }
    });

  } catch (error) {
    console.error("ONDC Webhook Error:", error);
    return NextResponse.json({
      message: {
        ack: {
          status: "NACK"
        }
      },
      error: {
        type: "SYSERR",
        code: "500",
        message: "Internal Error Parsing ONDC Payload"
      }
    }, { status: 500 });
  }
}
