# services/4-security-operations/ml-anomaly-detector.py
import pandas as pd
from sklearn.ensemble import IsolationForest
import logging
import json

logging.basicConfig(level=logging.INFO)

def train_and_detect(log_file_path):
    """
    Trains an Isolation Forest on access logs to detect behavioral anomalies.
    In a production Render environment, these logs would be streamed via Kafka or Redis.
    """
    logging.info("Initializing ML Anomaly Detection Engine...")
    
    try:
        # Simulate loading access logs (Feature engineering: request_size, response_time, endpoint_risk_score)
        # In reality, you'd parse your Gateway access logs into a DataFrame.
        data = {
            'user_id': [1, 2, 1, 3, 1, 2, 4], # 4 is an attacker
            'request_size_bytes': [250, 300, 240, 500, 260, 310, 8500], 
            'response_time_ms': [45, 50, 42, 60, 44, 48, 1200],
            'failed_logins_24h': [0, 0, 0, 1, 0, 0, 15]
        }
        df = pd.DataFrame(data)
        
        # Features to train on
        features = df[['request_size_bytes', 'response_time_ms', 'failed_logins_24h']]
        
        # Initialize Isolation Forest (contamination is the expected % of anomalies)
        model = IsolationForest(n_estimators=100, contamination=0.15, random_state=42)
        model.fit(features)
        
        # Predict anomalies (-1 = Anomaly, 1 = Normal)
        df['anomaly_score'] = model.predict(features)
        
        # Filter and alert on anomalies
        anomalies = df[df['anomaly_score'] == -1]
        
        if not anomalies.empty:
            logging.warning(f"🚨 [ALERT] Detected {len(anomalies)} anomalous user behaviors!")
            logging.warning(f"Anomaly Details:\n{anomalies}")
            # Trigger webhook to SIEM or Slack here
        else:
            logging.info("✅ No anomalies detected in current traffic window.")

    except Exception as e:
        logging.error(f"Failed to process logs: {e}")

if __name__ == "__main__":
    # Run the detection cycle
    train_and_detect("dummy_log_path.json")