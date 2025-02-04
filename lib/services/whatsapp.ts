import { Order, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WHATSAPP_API_URL =
  "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

type OrderWithUser = Order & {
  user: {
    name: string;
    phoneNumber: string;
  };
};

type MessageTemplate = {
  status: string;
  template: (order: OrderWithUser) => string;
};

const messageTemplates: MessageTemplate[] = [
  {
    status: "PROCESSING",
    template: (order: OrderWithUser) =>
      `Merhaba ${order.user.name}, ${order.id} numaralı siparişinizin fiyatı belirlenmiştir:\n\n` +
      `Ürün: ${order.title}\n` +
      `Fiyat: $${order.price}\n` +
      `Kargo: $${order.shippingPrice}\n` +
      `Yerel Kargo: $${order.localShippingPrice}\n` +
      `Toplam: $${
        order.price + order.shippingPrice + order.localShippingPrice
      }\n\n` +
      `Siparişinizi onaylamak için lütfen bizimle iletişime geçin.`,
  },
  {
    status: "CANCELLED",
    template: (order: OrderWithUser) =>
      `Merhaba ${order.user.name}, ${order.id} numaralı siparişiniz iptal edilmiştir.\n\n` +
      `Detaylı bilgi için lütfen bizimle iletişime geçin.`,
  },
  {
    status: "CONFIRMED",
    template: (order: OrderWithUser) =>
      `Merhaba ${order.user.name}, ${order.id} numaralı siparişiniz onaylanmıştır.\n\n` +
      `Siparişinizin durumunu takip etmek için web sitemizi ziyaret edebilirsiniz.`,
  },
];

// Queue system
type QueueItem = {
  orderId: number;
  retries: number;
};

class MessageQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private readonly MAX_RETRIES = 3;
  private readonly DELAY_BETWEEN_MESSAGES = 5000; // 5 seconds

  async add(orderId: number) {
    this.queue.push({ orderId, retries: 0 });
    if (!this.processing) {
      this.process();
    }
  }

  private async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const item = this.queue[0];

    try {
      await sendWhatsAppMessageInternal(item.orderId);
      this.queue.shift(); // Remove successfully processed item
    } catch (error) {
      console.error(
        `Failed to send WhatsApp message for order ${item.orderId}:`,
        error
      );

      if (item.retries < this.MAX_RETRIES) {
        // Move to end of queue for retry
        this.queue.shift();
        this.queue.push({ orderId: item.orderId, retries: item.retries + 1 });
      } else {
        // Remove after max retries
        this.queue.shift();
        console.error(
          `Failed to send WhatsApp message for order ${item.orderId} after ${this.MAX_RETRIES} attempts`
        );
      }
    }

    // Wait before processing next message
    await new Promise((resolve) =>
      setTimeout(resolve, this.DELAY_BETWEEN_MESSAGES)
    );
    this.process();
  }
}

const messageQueue = new MessageQueue();

// Original message sending function becomes internal
async function sendWhatsAppMessageInternal(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!order || !order.user) return;

  const template = messageTemplates.find((t) => t.status === order.status);
  if (!template) return;

  const message = template.template(order as OrderWithUser);
  const phoneNumber = order.user.phoneNumber.replace(/\D/g, "");

  const response = await fetch(WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send WhatsApp message");
  }

  return response.json();
}

// Public function now adds to queue instead of sending directly
export async function sendWhatsAppMessage(orderId: number) {
  await messageQueue.add(orderId);
}
