import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIConversationThread, AIMessage } from '@/types';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        conversations: [],
        authenticated: false,
      });
    }

    const { data: convs, error } = await supabase
      .from('ai_conversations')
      .select(`
        *,
        messages:ai_messages(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Error fetching conversations from Supabase:', error.message);
      return NextResponse.json({
        conversations: [],
        authenticated: true,
        error: error.message,
      });
    }

    const threads: AIConversationThread[] = (convs || []).map((c: any) => ({
      id: c.id,
      user_id: c.user_id,
      title: c.title,
      adventure_id: c.adventure_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      messages: (c.messages || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          structured_data: m.structured_data,
          adventure_preview: m.structured_data,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
    }));

    return NextResponse.json({
      conversations: threads,
      authenticated: true,
    });
  } catch (err: any) {
    console.error('API /api/ai/conversations GET error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { id, title = 'New Adventure Plan', adventure_id = null, messages = [] } = body;

    const threadId = id || `thread-${Date.now()}`;
    const now = new Date().toISOString();

    if (user) {
      // Upsert conversation thread
      await supabase.from('ai_conversations').upsert({
        id: threadId,
        user_id: user.id,
        title,
        adventure_id,
        updated_at: now,
      });

      // Insert or update messages
      if (messages.length > 0) {
        const messageRows = messages.map((m: AIMessage, idx: number) => ({
          id: m.id || `msg-${Date.now()}-${idx}`,
          conversation_id: threadId,
          user_id: user.id,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          structured_data: m.structured_data || m.adventure_preview || null,
          created_at: now,
        }));

        await supabase.from('ai_messages').upsert(messageRows);
      }
    }

    const thread: AIConversationThread = {
      id: threadId,
      user_id: user?.id || 'guest-user',
      title,
      adventure_id,
      created_at: now,
      updated_at: now,
      messages,
    };

    return NextResponse.json({
      success: true,
      conversation: thread,
    });
  } catch (err: any) {
    console.error('API /api/ai/conversations POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('ai_messages').delete().eq('conversation_id', id);
      await supabase.from('ai_conversations').delete().eq('id', id).eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
