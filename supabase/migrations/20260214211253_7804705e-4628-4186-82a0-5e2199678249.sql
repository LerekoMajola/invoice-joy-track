
DROP TRIGGER IF EXISTS on_notification_send_email ON public.notifications;
DROP TRIGGER IF EXISTS on_notification_send_sms ON public.notifications;

CREATE TRIGGER on_notification_send_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_email_on_notification();

CREATE TRIGGER on_notification_send_sms
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sms_on_notification();
