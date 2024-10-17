/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, ChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { useEffect, useState } from "@webpack/common";

const settings = definePluginSettings({
    timerAmount: {
        type: OptionType.SLIDER,
        description: "The amount of seconds you want the timer to be",
        markers: [10, 20, 30, 40, 50, 60, 90, 120, 150, 180],
        default: 60,
        stickToMarkers: true
    }
});

export default definePlugin({
    name: "MessageCountdown",
    description: "Coming Soon",
    authors: [
        { name: "kewi", id: 292948682884775937n }
    ],
    settings,

    start() {
        addChatBarButton("MessageCountdown", () =>
            this.Timer({ self: this })
        );

        this.listener = addPreSendListener((_, msg) => {
            if (this.timeLeft <= 0) this.setTimeLeft(settings.store.timerAmount);
        });
    },

    stop() {
        removeChatBarButton("MessageCountdown");
        removePreSendListener(this.listener);
    },

    Timer({ self }) {
        const [timeLeft, setTimeLeft] = useState(0);
        self.timeLeft = timeLeft;
        self.setTimeLeft = setTimeLeft;

        useEffect(() => {
            var timer;
            if (timeLeft > 0) {
                timer = setInterval(() => {
                    setTimeLeft(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
            }

            return () => clearInterval(timer);
        }, [timeLeft]);

        return (
            <ChatBarButton
                tooltip="Reset Countdown!"
                onClick={() => {
                    setTimeLeft(0);
                }}
            >
                <p style={{ fontSize: "18px" }}>{timeLeft}</p>
            </ChatBarButton>
        );
    }
});
