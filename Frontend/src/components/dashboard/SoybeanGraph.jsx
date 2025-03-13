import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';
import { colors } from '../../styles/theme';

const SoybeanGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Using mock data to avoid CORS issues
    const mockData = [
      { name: 'Current', price: 1342.75 },
      { name: 'Last Close', price: 1340.50 },
      { name: 'Open', price: 1338.25 }
    ];
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
    
    /* Original code with CORS issues:
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.api-ninjas.com/v1/commodities', {
          headers: {
            'X-Api-Key': process.env.REACT_APP_SOYBEAN_API_KEY,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        const soybeanData = data.find(item => item.name === "Soybeans");
        
        if (soybeanData) {
          setData([
            { name: 'Current', price: soybeanData.price },
            { name: 'Last Close', price: soybeanData.last_close },
            { name: 'Open', price: soybeanData.open }
          ]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching soybean data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
    */
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ color: colors.text.error }}>Error loading soybean data: {error}</div>;

  return (
    <div style={{
      backgroundColor: colors.background.elevated,
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h3>Soybean Futures (Mock Data)</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={colors.primary} 
          activeDot={{ r: 8 }} 
        />
      </LineChart>
    </div>
  );
};

export default SoybeanGraph;