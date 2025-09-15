import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(async (req: AuthenticatedRequest) => {
    try {
      const note = await prisma.note.findFirst({
        where: {
          id: params.id,
          tenantId: req.user!.tenantId
        },
        include: {
          user: {
            select: { email: true }
          }
        }
      })

      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }

      return NextResponse.json(note)
    } catch (error) {
      console.error('Error fetching note:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })(request)
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(async (req: AuthenticatedRequest) => {
    try {
      const { title, content } = await req.json()

      if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
      }

      const note = await prisma.note.findFirst({
        where: {
          id: params.id,
          tenantId: req.user!.tenantId,
          ...(req.user!.role === 'ADMIN' ? {} : { userId: req.user!.userId })
        }
      })

      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }

      const updatedNote = await prisma.note.update({
        where: { id: params.id },
        data: { title, content },
        include: {
          user: {
            select: { email: true }
          }
        }
      })

      return NextResponse.json(updatedNote)
    } catch (error) {
      console.error('Error updating note:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })(request)
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(async (req: AuthenticatedRequest) => {
    try {
      const note = await prisma.note.findFirst({
        where: {
          id: params.id,
          tenantId: req.user!.tenantId,
          ...(req.user!.role === 'ADMIN' ? {} : { userId: req.user!.userId })
        }
      })

      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }

      await prisma.note.delete({
        where: { id: params.id }
      })

      return NextResponse.json({ message: 'Note deleted successfully' })
    } catch (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })(request)
}
