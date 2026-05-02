# services/4-security-operations/log-ingester.py
import time
import logging

logging.basicConfig(level=logging.INFO)

def ingest_logs():
    """
    In a real enterprise, this connects to a Redis Stream or Kafka topic
    where the API Gateway publishes its access logs.
    """
    logging.info("Starting Log Ingester Service...")
    while True:
        try:
            # Simulating pulling a batch of logs
            logging.info("Polling for new gateway access logs...")
            time.sleep(10) # Poll every 10 seconds
            
            # Here it would pass the data to ml-anomaly-detector.py
            logging.info("Log batch processed and sent to ML engine.")
            
        except KeyboardInterrupt:
            logging.info("Shutting down Log Ingester.")
            break

if __name__ == "__main__":
    ingest_logs()