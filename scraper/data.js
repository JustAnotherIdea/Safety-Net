const data = {
  "Housing": {
      image: '',
      subcategories: [
          { name: 'Shelters', image: 'https://images.pexels.com/photos/3119909/pexels-photo-3119909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Low income housing', image: 'https://images.pexels.com/photos/11827594/pexels-photo-11827594.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Hostels', image: 'https://images.pexels.com/photos/5137787/pexels-photo-5137787.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Camping sites', image: 'https://images.pexels.com/photos/28970008/pexels-photo-28970008/free-photo-of-historic-lookout-on-three-fingers-mountain-at-sunset.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Public restroom map', image: null },
          { name: 'Public shower map', image: 'https://images.pexels.com/photos/28967310/pexels-photo-28967310/free-photo-of-outdoor-beach-showers-in-coastal-landscape-setting.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Disaster shelters', image: 'https://images.pexels.com/photos/1739855/pexels-photo-1739855.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Transportation": {
      image: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Public transportation schedules and routes', image: 'https://images.pexels.com/photos/19805822/pexels-photo-19805822/free-photo-of-train-arriving-at-a-metro-station-in-istanbul.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Transportation apps', image: 'https://images.pexels.com/photos/6945640/pexels-photo-6945640.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Food & Water": {
      image: 'https://images.pexels.com/photos/28962507/pexels-photo-28962507/free-photo-of-gourmet-meal-with-sandwich-and-fries-on-marble-table.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Soup kitchens', image: 'https://images.pexels.com/photos/28947809/pexels-photo-28947809/free-photo-of-cup-of-samyang-ramen-with-chopsticks.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Food stamps', image: 'https://images.pexels.com/photos/7235533/pexels-photo-7235533.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Food banks', image: 'https://images.pexels.com/photos/13983276/pexels-photo-13983276.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Water fountain map', image: 'https://images.pexels.com/photos/18189554/pexels-photo-18189554/free-photo-of-a-man-standing-in-front-of-a-fountain.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Public restroom map', image: 'https://images.pexels.com/photos/4553370/pexels-photo-4553370.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Financial Assistance": {
      image: 'https://images.pexels.com/photos/6863250/pexels-photo-6863250.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Unemployment', image: 'https://images.pexels.com/photos/897817/pexels-photo-897817.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Disability', image: 'https://images.pexels.com/photos/2026764/pexels-photo-2026764.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Food Stamps', image: 'https://images.pexels.com/photos/7235533/pexels-photo-7235533.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Rent/Bill aid programs', image: null },
          { name: 'Social Security', image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Mental Health": {
      image: 'https://images.pexels.com/photos/28965920/pexels-photo-28965920/free-photo-of-contemplative-woman-in-nature-by-a-stream.jpeg?auto=compress&cs=tinysrgb&w=1260&dpr=1&w=500',
      subcategories: [
          { name: 'Crisis hotlines', image: 'https://images.pexels.com/photos/6034773/pexels-photo-6034773.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Local mental health clinics and therapists', image: 'https://images.pexels.com/photos/7176029/pexels-photo-7176029.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Online counseling and therapy', image: 'https://images.pexels.com/photos/3958401/pexels-photo-3958401.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Addiction": {
      image: 'https://safety-net-images.s3.amazonaws.com/iStock-1203163873.jpg',
      subcategories: [
          { name: 'Crisis hotlines', image: 'https://images.pexels.com/photos/6034773/pexels-photo-6034773.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Local shelters and rehab centers', image: 'https://images.pexels.com/photos/9181646/pexels-photo-9181646.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Counseling and therapy', image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Abuse": {
      image: 'https://images.pexels.com/photos/7699321/pexels-photo-7699321.jpeg?auto=compress&cs=tinysrgb&w=500',
      subcategories: [
          { name: 'Crisis hotlines', image: 'https://images.pexels.com/photos/6034773/pexels-photo-6034773.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Local shelters', image: 'https://images.pexels.com/photos/9181646/pexels-photo-9181646.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Counseling and therapy', image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Legal Help & Documents": {
      image: 'https://images.pexels.com/photos/7681194/pexels-photo-7681194.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Social Security Card', image: 'https://images.pexels.com/photos/7621127/pexels-photo-7621127.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Birth certificate', image: 'https://images.pexels.com/photos/4005611/pexels-photo-4005611.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'ID/Drivers License', image: null },
          { name: 'Citizenship', image: 'https://images.pexels.com/photos/5926258/pexels-photo-5926258.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Legal advice', image: 'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Legal aid societies', image: 'https://images.pexels.com/photos/6077476/pexels-photo-6077476.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Jobs": {
      image: 'https://images.pexels.com/photos/327540/pexels-photo-327540.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Temp agencies', image: 'https://images.pexels.com/photos/5656745/pexels-photo-5656745.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Job listings', image: 'https://images.pexels.com/photos/9841351/pexels-photo-9841351.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Soft skills', image: 'https://images.pexels.com/photos/19915776/pexels-photo-19915776/free-photo-of-woman-sitting-on-a-sofa-with-a-laptop-displaying-a-chart.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Education": {
      image: 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=600',
      subcategories: [
          { name: 'Free GED resources', image: 'https://images.pexels.com/photos/6546413/pexels-photo-6546413.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Free educational books', image: 'https://images.pexels.com/photos/6041281/pexels-photo-6041281.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Free online courses', image: 'https://images.pexels.com/photos/4012966/pexels-photo-4012966.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Free certifications', image: 'https://images.pexels.com/photos/28927320/pexels-photo-28927320/free-photo-of-majestic-seagull-in-flight-against-clear-sky.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Free and low cost college', image: 'https://images.pexels.com/photos/5965930/pexels-photo-5965930.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Safety Tips": {
      image: 'https://images.pexels.com/photos/5245929/pexels-photo-5245929.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Camping safety tips', image: 'https://images.pexels.com/photos/12749404/pexels-photo-12749404.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Urban camping/shelter tips', image: null },
          { name: 'Hitchhiking safety tips', image: 'https://images.pexels.com/photos/8213107/pexels-photo-8213107.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  },
  "Health & Hygiene": {
      image: 'https://images.pexels.com/photos/28861615/pexels-photo-28861615/free-photo-of-hand-holding-cleansing-oil-dispenser-in-minimalist-setting.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      subcategories: [
          { name: 'Personal hygiene tips', image: 'https://images.pexels.com/photos/9832130/pexels-photo-9832130.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Access to public showers', image: 'https://images.pexels.com/photos/28967310/pexels-photo-28967310/free-photo-of-outdoor-beach-showers-in-coastal-landscape-setting.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Dental care resources', image: 'https://images.pexels.com/photos/287227/pexels-photo-287227.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Free or low-cost health clinics', image: 'https://images.pexels.com/photos/16450237/pexels-photo-16450237/free-photo-of-an-ecg-paper-on-a-table-with-a-heart-monitor.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Vaccination services', image: 'https://images.pexels.com/photos/3786215/pexels-photo-3786215.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Sexual health and contraception', image: 'https://images.pexels.com/photos/3787097/pexels-photo-3787097.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Basic first aid', image: 'https://images.pexels.com/photos/11826942/pexels-photo-11826942.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Hygiene products distribution centers', image: 'https://images.pexels.com/photos/7106731/pexels-photo-7106731.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Skincare and wound care', image: 'https://images.pexels.com/photos/7588647/pexels-photo-7588647.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          { name: 'Public restroom locations', image: 'https://images.pexels.com/photos/5527559/pexels-photo-5527559.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }
      ]
  }
};

module.exports = data;
