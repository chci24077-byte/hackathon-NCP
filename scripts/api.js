(function(){
  const apiUrl = '/api/tasks';
  const mockUrl = 'mock/tasks.json';

  async function fetchTasks(){
    // Try real API first, but fall back to mock if the API is unavailable or returns an error.
    try{
      const res = await fetch(apiUrl);
      if(res.ok){
        const data = await res.json();
        return normalize(data);
      }
      console.warn(`API ${apiUrl} returned status ${res.status}. Falling back to mock data.`);
    }catch(e){
      console.warn(`API fetch failed: ${e.message}. Falling back to mock data.`);
    }

    const res2 = await fetch(mockUrl);
    const data2 = await res2.json();
    console.info(`Loaded tasks from mock data (${mockUrl}).`);
    return normalize(data2);
  }

  function normalize(items){
    if(!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id ?? item.taskId ?? '',
      title: item.title ?? item.name ?? '',
      course: item.course ?? item.subject ?? '',
      service: item.service ?? item.source ?? 'Unknown',
      due: item.due ?? item.deadline ?? null,
      status: item.status ?? (item.submitted ? '提出済み' : '未提出')
    }));
  }

  window.api = { fetchTasks };
})();
