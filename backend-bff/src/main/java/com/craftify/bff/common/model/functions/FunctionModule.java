package com.craftify.bff.common.model.functions;

import java.util.List;

public record FunctionModule(
        String name,
        String description,
        List<Handler> handlers,
        List<Page> pages
) {
    public record Handler(
            String eventType,
            String file,
            String function
    ) {}
    public record Page(
            String file,
            String route,
            Menu menu,
            String submitHandler
    ) {
        public record Menu(
                List<MenuPath> path,
                String id,
                String label
        ) {
            public record MenuPath(
                    String id,
                    String label
            ) {}

        }
    }
}

