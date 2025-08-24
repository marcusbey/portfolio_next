import glob from "fast-glob";
import * as path from "path";

async function importBlog(blogFileName: string) {
  if (!blogFileName || typeof blogFileName !== 'string') {
    console.warn('Invalid blog filename:', blogFileName);
    return null;
  }
  
  try {
    let { meta, default: component } = await import(
      `../pages/blogs/${blogFileName}`
    );
    return {
      slug: blogFileName.replace(/(\/index)?\.mdx$/, ""),
      ...meta,
      component,
    };
  } catch (error) {
    console.error(`Failed to import blog: ${blogFileName}`, error);
    return null;
  }
}

export async function getAllBlogs() {
  try {
    let blogFileNames = await glob(["*.mdx", "*/index.mdx"], {
      cwd: path.join(process.cwd(), "pages/blogs"),
    });

    console.log('Found blog files:', blogFileNames);

    let blogs = await Promise.all(blogFileNames.map(importBlog));
    
    // Filter out null values from failed imports
    let validBlogs = blogs.filter(blog => blog !== null);

    return validBlogs.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    return [];
  }
}
