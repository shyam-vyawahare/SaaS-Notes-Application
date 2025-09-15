import { NextRequest, NextResponse } from 'next/server'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// POST /api/tenants/[slug]/upgrade - Upgrade tenant to Pro plan
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return requireRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
    try {
      const { slug } = params

      // Verify the tenant exists and the user belongs to it
      const tenant = await prisma.tenant.findUnique({
        where: { slug }
      })

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }

      if (tenant.id !== req.user!.tenantId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Update tenant to Pro plan
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: { subscriptionPlan: 'PRO' }
      })

      return NextResponse.json({
        message: 'Tenant upgraded to Pro successfully',
        tenant: updatedTenant
      })
    } catch (error) {
      console.error('Error upgrading tenant:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })(request)
}

