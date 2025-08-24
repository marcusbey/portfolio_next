const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const projectCount = await prisma.project.count()
    console.log(`📊 Found ${projectCount} projects in database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()