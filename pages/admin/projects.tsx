import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { ProjectDashboard } from '@/components/admin/ProjectDashboard'

export default function AdminProjectsPage() {
  return (
    <>
      <Head>
        <title>Project Dashboard - Admin</title>
        <meta name="description" content="Manage website projects" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <ProjectDashboard />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Simple authentication check
  // In production, you should use a more robust authentication system
  const authCookie = context.req.headers.cookie?.includes('admin-auth=true')
  
  if (!authCookie) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}