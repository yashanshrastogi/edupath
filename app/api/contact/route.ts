import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, you would send an email or save to a database here.
    // For now, we just log and return success to simulate the contact form working.
    console.log('Received contact form submission:', body);

    return NextResponse.json(
      { message: 'Message received successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
