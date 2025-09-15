import { NextRequest, NextResponse } from 'next/server'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// POST /api/users/invite (Admin only)
// Body: { email: string, role: 'ADMIN' | 'MEMBER' }
export async function POST(request: NextRequest) {
  return requireRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
    try {
      const { email, role } = await request.json()

      if (!email || !role || !['ADMIN', 'MEMBER'].includes(role)) {
        return NextResponse.json({ error: 'email and valid role are required' }, { status: 400 })
      }

      // Ensure user does not already exist in any tenant
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }

      // Create a temporary password for the invited user
      const tempPassword = 'password'
      const passwordHash = await hashPassword(tempPassword)

      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          role,
          tenantId: req.user!.tenantId,
        },
        select: { id: true, email: true, role: true, tenantId: true }
      })

      return NextResponse.json({
        user,
        temporaryPassword: tempPassword
      }, { status: 201 })
    } catch (error) {
      console.error('Invite user error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })(request)
}


