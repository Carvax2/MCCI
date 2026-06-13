import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const NCB_INSTANCE = '53990_aria_os';
const NCB_DATA_API_URL = 'https://app.nocodebackend.com/api/data';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const url = `${NCB_DATA_API_URL}/create/reflections?Instance=${NCB_INSTANCE}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Database-Instance': NCB_INSTANCE
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const result = await response.json();
    return json({ success: true, data: result });
    
  } catch (error: any) {
    console.error('Error guardando reflexión:', error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};
