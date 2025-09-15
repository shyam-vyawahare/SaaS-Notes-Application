import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const name = tenantName && String(tenantName).trim().length > 0 ? String(tenantName).trim() : email.split('@')[0]
    const slugBase = slugify(name)
    let slug = slugBase
    let i = 1
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`
    }

    const passwordHash = await hashPassword(password)

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        subscriptionPlan: 'FREE'
      }
    })

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: 'ADMIN',
        tenantId: tenant.id
      },
      include: { tenant: true }
    })

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role as 'ADMIN' | 'MEMBER',
      email: user.email
    })

    return NextResponse.json({ token, user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId, tenant: user.tenant } }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


