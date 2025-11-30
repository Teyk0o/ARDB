/**
 * Discord API utilities
 * Handles OAuth flow and role verification
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface DiscordGuildMember {
  user: DiscordUser;
  roles: string[];
  nick?: string;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

/**
 * Get Discord user information using access token
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Discord user: ${error}`);
  }

  return response.json();
}

/**
 * Get Discord guild member information (including roles)
 * Requires bot token
 */
export async function getGuildMember(
  guildId: string,
  userId: string
): Promise<DiscordGuildMember | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    console.warn('DISCORD_BOT_TOKEN not set, cannot check guild membership');
    return null;
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      // User is not a member of the guild
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get guild member: ${error}`);
  }

  return response.json();
}

/**
 * Check if a Discord user has moderator role
 */
export async function checkModeratorRole(discordId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID || '1439278522924404744';
  const moderatorRoleId = process.env.DISCORD_MODERATOR_ROLE_ID || '1443865078779875443';

  try {
    const member = await getGuildMember(guildId, discordId);

    if (!member) {
      return false;
    }

    return member.roles.includes(moderatorRoleId);
  } catch (error) {
    console.error('Error checking moderator role:', error);
    return false;
  }
}

/**
 * Get Discord avatar URL
 */
export function getAvatarUrl(
  userId: string,
  avatarHash: string | null,
  size = 128
): string {
  if (!avatarHash) {
    // Default avatar
    const defaultAvatarIndex = parseInt(userId) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
  }

  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=${size}`;
}

/**
 * Generate Discord OAuth URL
 */
export function getDiscordAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    response_type: 'code',
    scope: 'identify email',
  });

  if (state) {
    params.append('state', state);
  }

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/**
 * Send notification to Discord webhook
 */
export async function sendDiscordWebhook(data: {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    url?: string;
    timestamp?: string;
    footer?: { text: string; icon_url?: string };
    thumbnail?: { url: string };
  }>;
}): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL not set, skipping notification');
    return;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send Discord webhook:', error);
    throw new Error(`Failed to send Discord webhook: ${error}`);
  }
}

/**
 * Notify moderators about new edit proposal
 */
export async function notifyNewEditProposal(data: {
  editId: number;
  itemId: string;
  itemName: string;
  username: string;
  reason?: string;
}): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ardb.vercel.app';

  await sendDiscordWebhook({
    embeds: [
      {
        title: '📝 Nouvelle proposition de modification',
        description: `**${data.username}** a proposé une modification pour **${data.itemName}**`,
        color: 0xf1aa1c, // arc-yellow
        fields: [
          { name: 'Item ID', value: data.itemId, inline: true },
          { name: 'Proposition #', value: `${data.editId}`, inline: true },
          ...(data.reason
            ? [{ name: 'Raison', value: data.reason.slice(0, 200), inline: false }]
            : []),
        ],
        url: `${baseUrl}/moderation/edit/${data.editId}`,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Arc Raiders Database',
        },
      },
    ],
  });
}

/**
 * Notify about sync conflict
 */
export async function notifySyncConflict(data: {
  itemId: string;
  itemName: string;
  conflictId: number;
}): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ardb.vercel.app';

  await sendDiscordWebhook({
    embeds: [
      {
        title: '⚠️ Conflit de synchronisation détecté',
        description: `Un conflit a été détecté pour **${data.itemName}** entre les données RaidTheory et les modifications communautaires.`,
        color: 0xff6b6b, // Red
        fields: [
          { name: 'Item ID', value: data.itemId, inline: true },
          { name: 'Conflit #', value: `${data.conflictId}`, inline: true },
        ],
        url: `${baseUrl}/moderation/conflicts/${data.conflictId}`,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Arc Raiders Database - Action requise',
        },
      },
    ],
  });
}
