(function(){
  async function fetchTasks(){
    // Try real API first
    try{
      const res = await fetch('/api/tasks');
      if(res.ok){
        const data = await res.json();
        return normalize(data);
      }
    }catch(e){
      // ignore and fallback to mock
    }
    // Fallback to local mock data
    const res2 = await fetch('mock/tasks.json');
    const data2 = await res2.json();
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
