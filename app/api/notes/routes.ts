import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/notes - List all notes for the current tenant
export const GET = authMiddleware(async (req: AuthenticatedRequest) => {
  try {
    const notes = await prisma.note.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        user: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/notes - Create a new note
export const POST = authMiddleware(async (req: AuthenticatedRequest) => {
  try {
    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Check tenant subscription and note limit
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // If tenant is on FREE plan, check note limit
    if (tenant.subscriptionPlan === 'FREE') {
      const noteCount = await prisma.note.count({
        where: { tenantId: req.user!.tenantId }
      })

      if (noteCount >= 3) {
        return NextResponse.json({ 
          error: 'Note limit reached. Upgrade to Pro for unlimited notes.' 
        }, { status: 403 })
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tenantId: req.user!.tenantId,
        userId: req.user!.userId
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
