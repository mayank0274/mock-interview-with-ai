from inngest import Inngest
import logging

inngest_client = Inngest(app_id="interviewly", logger=logging.getLogger("uvicorn"))
