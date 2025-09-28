import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ArtikelList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/artikel')
      .then(res => setArticles(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Daftar Artikel</h2>
      {articles.map(a => (
        <div key={a._id}>
          <h3>{a.judul}</h3>
          <p>{a.isi}</p>
        </div>
      ))}
    </div>
  );
}
