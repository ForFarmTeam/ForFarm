WITH new_articles AS (
    INSERT INTO knowledge_articles (uuid, title, content, author, publish_date, read_time, categories, image_url) VALUES
    (gen_random_uuid(), 'Introduction to Sustainable Farming Practices',
    'Sustainable farming represents a holistic approach to agriculture, aiming to meet present food needs without compromising the ability of future generations to meet their own. It is built upon three interconnected pillars: environmental stewardship, economic viability, and social equity.
    Environmental stewardship involves practices that protect natural resources. This includes minimizing soil erosion through techniques like cover cropping and conservation tillage, conserving water via efficient irrigation and rainwater harvesting, enhancing biodiversity by creating habitats for beneficial insects and wildlife, and reducing reliance on synthetic pesticides and fertilizers through integrated pest management and organic nutrient sources.
    Economic viability ensures that farms can be profitable in the long term. Sustainable practices often lead to reduced input costs (e.g., less fertilizer, fuel, pesticides), improved soil health leading to more resilient yields, and access to premium markets for sustainably produced goods. Diversification of crops and income streams also enhances economic stability.
    Social equity focuses on the well-being of farmers, farmworkers, and rural communities. This includes fair labor practices, safe working conditions, community engagement, and ensuring access to healthy, affordable food for all. Sustainable agriculture seeks to strengthen rural economies and preserve farming traditions.',
    'Dr. Green Thumb', '2024-10-15 09:00:00+00', '18 min', '{"Sustainable Agriculture", "Organic Farming", "Environment", "Ethics"}', 'https://cdn-images.prepp.in/public/image/3df40c01a2d35b7c81a551aea4108492.png?tr=w-512,h-266,c-force
'),

    (gen_random_uuid(), 'The Importance of Soil Health for Crop Production',
    'Soil is far more than just dirt; it is a complex, living ecosystem crucial for agriculture and planetary health. Healthy soil forms the foundation for productive farming systems, influencing everything from crop yield and quality to water regulation and climate resilience.
    Key components of soil health include its physical structure (aggregation, porosity affecting water infiltration and root growth), chemical properties (pH, nutrient availability, low levels of contaminants), and biological activity (diverse populations of bacteria, fungi, earthworms, and other organisms that drive nutrient cycling and organic matter decomposition).
    Organic matter is particularly vital, acting like a sponge to hold water and nutrients, improving soil structure, and providing food for soil microbes. Practices that build soil health include minimizing tillage (which disrupts soil structure and exposes organic matter to decomposition), planting cover crops (which protect the soil surface, suppress weeds, and add organic matter), applying compost or manure (to add nutrients and organic matter), and implementing diverse crop rotations (which vary nutrient demands and root structures). Investing in soil health leads to more resilient crops, reduced need for synthetic inputs, better water management, and carbon sequestration, contributing to climate change mitigation.',
    'Professor Terra Firma', '2024-11-01 11:30:00+00', '22 min', '{"Soil Science", "Agronomy", "Crop Management", "Organic Matter", "Conservation"}', 'https://www.agrirs.co.uk/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd09yU0E9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--21f5faececdc7e93df2536d2543ffd3a906b5b28/Soil.jpg'),

    (gen_random_uuid(), 'Integrated Pest Management (IPM) in Agriculture',
    'Integrated Pest Management (IPM) offers a smarter, more sustainable approach to dealing with pests (insects, weeds, diseases) in agricultural settings. Rather than relying solely on routine chemical applications, IPM employs a multi-faceted strategy based on understanding pest life cycles and their interaction with the environment.
    The core steps of IPM include:
    1. Prevention: Utilizing practices that prevent pest buildup, such as selecting pest-resistant crop varieties, rotating crops to disrupt pest cycles, maintaining healthy soil, and managing field sanitation.
    2. Monitoring (Scouting): Regularly inspecting fields to identify pests present, determine their population levels, and assess potential damage. This involves using traps, visual inspection, and understanding pest biology.
    3. Establishing Action Thresholds: Determining the pest population level at which control measures are economically justified to prevent unacceptable damage. Not every pest sighting warrants intervention.
    4. Control Methods: If thresholds are exceeded, selecting the most effective and least disruptive control method. IPM prioritizes non-chemical tactics first, such as biological controls (introducing or conserving natural enemies like ladybugs or parasitic wasps), cultural controls (adjusting planting times, trap cropping), and physical/mechanical controls (tillage, traps, hand-weeding). Chemical controls (pesticides) are used selectively as a last resort, choosing targeted, less toxic options when possible and applying them carefully to minimize harm to beneficial organisms and the environment.',
    'Agri Protect Inc.', '2025-01-20 14:00:00+00', '20 min', '{"Pest Control", "Crop Protection", "Sustainable Agriculture", "Biological Control", "Monitoring"}', 'https://2genesis.com/wp-content/uploads/2019/09/DbDbD3LWkAA9gnt.jpg'), -- Note: Reused image URL as per original
    (gen_random_uuid(), 'Efficient Water Use: Modern Irrigation Techniques',
    'Water is an increasingly precious resource, making efficient irrigation critical for sustainable agriculture, especially in arid and semi-arid regions. Modern techniques focus on delivering water precisely when and where crops need it, minimizing losses due to evaporation, runoff, and deep percolation.
    Key modern irrigation methods include:
    1. Drip Irrigation: Delivers water slowly and directly to the plant root zone through a network of tubes and emitters. This is highly efficient (often >90%), reducing water use, weed growth, and nutrient leaching. It is suitable for row crops, orchards, and vineyards.
    2. Micro-Sprinklers: Similar to drip but wets a slightly larger area, suitable for tree crops or areas where emitters might clog.
    3. Precision Sprinklers: Modern center pivots and linear move systems equipped with low-pressure nozzles (e.g., LEPA - Low Energy Precision Application) that apply water closer to the ground, reducing wind drift and evaporation. Variable Rate Irrigation (VRI) technology allows adjusting water application across different zones within a field based on soil type or topography.
    Effective water management also involves sophisticated scheduling based on real-time data from soil moisture sensors, weather stations (calculating evapotranspiration - ET), and plant sensors. Regular system maintenance, including checking for leaks and ensuring uniform pressure, is essential for maintaining high efficiency.',
    'AquaGrow Solutions', '2025-03-05 10:00:00+00', '16 min', '{"Irrigation", "Water Management", "Technology", "Conservation", "Precision Agriculture"}', 'https://media.licdn.com/dms/image/v2/D4D12AQHdYOBNV0mlPw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1690635881527?e=2147483647&v=beta&t=tttnkj0tTShy0NbZ1ThIcxq9ya4mp0K6aZU9Lio2gt4
'), -- Note: Reused image URL as per original
    (gen_random_uuid(), 'Understanding Crop Rotation Benefits',
    'Crop rotation is the practice of growing a series of different types of crops in the same field across sequential seasons. It is a cornerstone of sustainable agriculture, moving away from monoculture (growing the same crop year after year) to harness natural ecological processes for farm benefit.
    The advantages are numerous:
    1. Improved Soil Fertility: Different crops have different nutrient requirements and rooting depths. Legumes (like beans, peas, clover) fix atmospheric nitrogen, enriching the soil for subsequent crops like corn, which demands high nitrogen. Deep-rooted crops can draw nutrients from lower soil layers.
    2. Pest and Disease Management: Planting the same crop repeatedly allows specific pests and diseases to build up in the soil. Rotating crops disrupts these cycles, as pests specific to one crop may not survive or thrive on the next one in the sequence.
    3. Weed Control: Different crops compete differently with weeds due to variations in planting times, canopy structure, and tillage practices associated with them. Some rotations incorporate cover crops specifically for weed suppression.
    4. Enhanced Soil Structure: Varying root systems (fibrous vs. taproots) improve soil aggregation, water infiltration, and aeration. Reduced tillage associated with some rotation phases also helps build organic matter.
    Planning an effective rotation requires considering factors like crop type (legume, grass, root crop), nutrient needs, pest susceptibility, market value, and integration with livestock if applicable.',
    'Farm Cycle Experts', '2025-04-01 08:00:00+00', '17 min', '{"Agronomy", "Soil Health", "Sustainable Agriculture", "Pest Control", "Nutrient Cycling"}', 'https://usfarmersandranchers.org/wp-content/uploads/2020/06/benefits-of-crop-rotation-hero.jpg
'), -- Note: Reused image URL as per original
    (gen_random_uuid(), 'Introduction to Hydroponics Systems',
    'Hydroponics offers an innovative method for growing plants without using soil. Instead, plant roots are suspended in, or periodically exposed to, a nutrient-rich water solution. This soilless cultivation technique allows for precise control over plant nutrition and environmental factors.
    Common hydroponic systems include:
    1. Deep Water Culture (DWC): Plant roots are suspended in an oxygenated nutrient solution. Simple and effective for leafy greens like lettuce.
    2. Nutrient Film Technique (NFT): A continuous, shallow stream of nutrient solution flows over the bare roots in a sloped channel or tube. Widely used commercially.
    3. Drip Systems: Nutrient solution is dripped onto the base of plants grown in an inert medium (like coco coir, rockwool, or perlite) which provides support. Excess solution can be recirculated or drained.
    4. Wick Systems: A passive system where a wick draws nutrient solution from a reservoir up to the growing medium via capillary action. Simple but suitable mainly for smaller plants.
    5. Aeroponics: Plant roots hang in the air and are misted with nutrient solution at regular intervals. Provides excellent oxygenation but requires reliable misting equipment.
    Advantages of hydroponics include significantly reduced water usage compared to traditional farming (up to 90% less), faster plant growth due to readily available nutrients and oxygen, suitability for areas with poor soil or limited space (like urban farming), and fewer soil-borne pests and diseases. However, challenges include higher initial setup costs, reliance on electricity, the need for careful nutrient solution management (monitoring pH and EC - electrical conductivity), and the potential for rapid spread of waterborne diseases if not managed properly.',
    'Hydro Futures Ltd.', '2025-04-15 16:00:00+00', '19 min', '{"Hydroponics", "Soilless Culture", "Technology", "Urban Farming", "Water Conservation"}', 'https://agribusinessedu.com/wp-content/uploads/2021/05/a-brief-introduction-to-hydroponics-2021-05-01-373913.jpg
') -- Note: Reused image URL as per original
    ON CONFLICT (uuid) DO NOTHING
    RETURNING uuid, title -- Return UUIDs and titles to link related data
),
toc_inserts AS (
    INSERT INTO table_of_contents (uuid, article_id, title, level, "order")
    SELECT gen_random_uuid(), na.uuid, 'What is Sustainable Farming?', 1, 1 FROM new_articles na WHERE na.title = 'Introduction to Sustainable Farming Practices' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Environmental Stewardship', 2, 2 FROM new_articles na WHERE na.title = 'Introduction to Sustainable Farming Practices' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Economic Viability', 2, 3 FROM new_articles na WHERE na.title = 'Introduction to Sustainable Farming Practices' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Social Equity', 2, 4 FROM new_articles na WHERE na.title = 'Introduction to Sustainable Farming Practices' UNION ALL

    SELECT gen_random_uuid(), na.uuid, 'The Living Soil Ecosystem', 1, 1 FROM new_articles na WHERE na.title = 'The Importance of Soil Health for Crop Production' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Key Components (Physical, Chemical, Biological)', 1, 2 FROM new_articles na WHERE na.title = 'The Importance of Soil Health for Crop Production' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'The Role of Organic Matter', 2, 3 FROM new_articles na WHERE na.title = 'The Importance of Soil Health for Crop Production' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Practices to Build Soil Health', 1, 4 FROM new_articles na WHERE na.title = 'The Importance of Soil Health for Crop Production' UNION ALL

    SELECT gen_random_uuid(), na.uuid, 'Principles of IPM', 1, 1 FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Step 1: Prevention', 2, 2 FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Step 2: Monitoring and Thresholds', 2, 3 FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Step 3: Control Methods (Non-Chemical First)', 2, 4 FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Chemical Controls as Last Resort', 3, 5 FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL

    SELECT gen_random_uuid(), na.uuid, 'The Need for Water Efficiency', 1, 1 FROM new_articles na WHERE na.title = 'Efficient Water Use: Modern Irrigation Techniques' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Drip and Micro-Irrigation', 1, 2 FROM new_articles na WHERE na.title = 'Efficient Water Use: Modern Irrigation Techniques' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Precision Sprinkler Systems (LEPA, VRI)', 1, 3 FROM new_articles na WHERE na.title = 'Efficient Water Use: Modern Irrigation Techniques' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Scheduling Tools and Maintenance', 1, 4 FROM new_articles na WHERE na.title = 'Efficient Water Use: Modern Irrigation Techniques' UNION ALL

    SELECT gen_random_uuid(), na.uuid, 'Defining Crop Rotation', 1, 1 FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Benefit: Improved Soil Fertility', 2, 2 FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Benefit: Pest and Disease Management', 2, 3 FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Benefit: Weed Control', 2, 4 FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Benefit: Enhanced Soil Structure', 2, 5 FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Planning a Rotation', 1, 6 FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL

    SELECT gen_random_uuid(), na.uuid, 'What is Hydroponics?', 1, 1 FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Common System Types (DWC, NFT, Drip, etc.)', 1, 2 FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Nutrient Film Technique (NFT) Details', 2, 3 FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Deep Water Culture (DWC) Details', 2, 4 FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems' UNION ALL
    SELECT gen_random_uuid(), na.uuid, 'Advantages and Disadvantages', 1, 5 FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems'
    ON CONFLICT (uuid) DO NOTHING
)
INSERT INTO related_articles (article_id, related_title, related_tag)
SELECT na.uuid, 'Crop Rotation Techniques', 'Soil Health' FROM new_articles na WHERE na.title = 'Introduction to Sustainable Farming Practices' UNION ALL
SELECT na.uuid, 'Water Conservation in Agriculture', 'Resource Management' FROM new_articles na WHERE na.title = 'Introduction to Sustainable Farming Practices' UNION ALL

SELECT na.uuid, 'Composting for Beginners', 'Soil Amendment' FROM new_articles na WHERE na.title = 'The Importance of Soil Health for Crop Production' UNION ALL
SELECT na.uuid, 'No-Till Farming Explained', 'Conservation Tillage' FROM new_articles na WHERE na.title = 'The Importance of Soil Health for Crop Production' UNION ALL

SELECT na.uuid, 'Common Agricultural Pests', 'Pest Identification' FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL
SELECT na.uuid, 'Beneficial Insects in the Garden', 'Biological Control' FROM new_articles na WHERE na.title = 'Integrated Pest Management (IPM) in Agriculture' UNION ALL

SELECT na.uuid, 'Rainwater Harvesting for Farms', 'Water Conservation' FROM new_articles na WHERE na.title = 'Efficient Water Use: Modern Irrigation Techniques' UNION ALL
SELECT na.uuid, 'Soil Moisture Sensors', 'Precision Agriculture' FROM new_articles na WHERE na.title = 'Efficient Water Use: Modern Irrigation Techniques' UNION ALL

SELECT na.uuid, 'Cover Cropping Guide', 'Soil Health' FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL
SELECT na.uuid, 'Legumes in Rotation', 'Nitrogen Fixation' FROM new_articles na WHERE na.title = 'Understanding Crop Rotation Benefits' UNION ALL

SELECT na.uuid, 'Choosing Hydroponic Nutrients', 'Plant Nutrition' FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems' UNION ALL
SELECT na.uuid, 'Vertical Farming Basics', 'Urban Agriculture' FROM new_articles na WHERE na.title = 'Introduction to Hydroponics Systems'
ON CONFLICT (uuid) DO NOTHING;