/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, ChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { getCurrentChannel } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import { useEffect, useState } from "@webpack/common";


const settings = definePluginSettings({
    countdownAmount: {
        type: OptionType.SLIDER,
        description: "The amount of seconds you want the countdown to be",
        markers: [10, 20, 30, 40, 50, 60, 70, 80, 90],
        default: 60,
        stickToMarkers: true
    }
});

const storage = new Map<string, Date>();

const CountdownComponent = ({ isMainChat }) => {
    if (!isMainChat) return null;

    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const loop = setInterval(() => {
            const channelId = getCurrentChannel()?.id;
            if (channelId) {
                const timeData = storage.get(channelId);

                if (timeData) {
                    const seconds = Math.floor((timeData.getTime() - new Date().getTime()) / 1000);
                    if (seconds > 0) {
                        setTimeLeft(seconds);
                    } else {
                        setTimeLeft(0);
                        storage.delete(channelId);
                    }
                }
            }
        }, 1000);

        return () => clearInterval(loop);
    }, []);

    return (
        <ChatBarButton
            tooltip="Reset Countdown!"
            onClick={() => {
                const channelId = getCurrentChannel()?.id;
                if (channelId) storage.delete(channelId);
                setTimeLeft(0);
            }}
        >
            <p style={{
                width: "24px",
                height: "24px",
                margin: 0,
                padding: 0,
                fontSize: "24px",
                alignContent: "center"
            }}>{String(timeLeft).padStart(String(settings.store.countdownAmount).length, "0")}</p>
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "MessageCountdown",
    description: "A countdown starts when you send a message, you need to wait for it to finish before it can start again",
    authors: [
        { name: "kewi", id: 292948682884775937n }
    ],
    settings,

    flux: {
        CHANNEL_SELECT: ({ guildId, _ }) => {
            if (guildId) {
                addChatBarButton("MessageCountdown", CountdownComponent);
            } else {
                removeChatBarButton("MessageCountdown");
            }
        }
    },

    start() {
        this.listener = addPreSendListener((channelId, _) => {
            const timeData = storage.get(channelId);
            const nowAndAmount = new Date().getTime() + (settings.store.countdownAmount * 1000);

            if (!timeData || timeData.getTime() > nowAndAmount) {
                storage.set(channelId, new Date(nowAndAmount));
            }
        });
    },

    stop() {
        removeChatBarButton("MessageCountdown");
        removePreSendListener(this.listener);
    },
});
