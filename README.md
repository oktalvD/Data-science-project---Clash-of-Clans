Clash of Clans Data Pipeline

Overview

This project demonstrates a complete data pipeline designed to automate the extraction, storage, processing, and visualization of Clash of Clans, Clan War League (CWL) performance data. The pipeline showcases the integration of multiple technologies to provide insights into player and clan performance through detailed Power BI dashboards and additional processing using PostgreSQL.

Features

- Clash of Clans API Integration:
Fetches detailed data for Clan War Leagues, including war and player performance statistics.

- Google Firebase Storage:
Data is organized and stored in a Realtime Database, structured by month and war details.

- PostgreSQL Integration:
Data is imported into a PostgreSQL database for additional querying and transformation, enabling advanced analytics and preprocessing.

- Data Aggregation:
Attack and defense statistics are summarized for all players in the clan, providing key metrics like average stars and destruction percentages.

- Excel Export:
Aggregated data is exported to Excel for easy sharing and analysis.

- Power BI Visualizations:
Processed data is used to create detailed Power BI dashboards. These visuals allow for comparison of player performance, tracking individual progress, and presenting overall clan statistics with clarity.

Technologies Used

- JavaScript: Core programming language for the pipeline.
- Firebase Admin SDK: Used to interact with Google Firebase for data storage and retrieval.
- Clash of Clans API: For fetching war and player performance data.
- PostgreSQL: For structured data storage, advanced querying, and transformation.
- Axios: For seamless HTTP requests.
- ExcelJS/xlsx: To export summarized data into Excel files.
- Power BI: For creating dynamic and detailed performance dashboards.

Workflow

1. Data Extraction
- Fetches Clan War League data for a specific clan using the Clash of Clans API.
- Extracts key war and player performance metrics, including attack and defense details.

2. Data Storage
- Saves the extracted data into Google Firebase, structured hierarchically for easy access and future queries.
- Data is also imported into PostgreSQL for additional processing and advanced analytics.

3. Data Processing
- Aggregates attack and defense statistics for all players, computing average stars, destruction percentages, and overall performance summaries.

4. Data Export
- Exports the aggregated data into an Excel workbook with separate sheets for attack and defense summaries.

5. Visualization
- The prepared data is visualized in Power BI dashboards, featuring comprehensive analysis and insights into player and clan performance.

Purpose

This project highlights the ability to build end-to-end data pipelines, integrating multiple technologies for real-world applications. It demonstrates skills in:

- API integration and data extraction.
- Cloud-based storage and data organization.
- Database management and querying with PostgreSQL.
- Data processing and aggregation.
- Building advanced Power BI dashboards for real-time performance tracking and comparison.
