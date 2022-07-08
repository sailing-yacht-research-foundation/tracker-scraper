terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "syrf-scrapper-data-terraform-state"
    key    = "global/s3/terraform.tfstate"
    region = "us-east-2"

    dynamodb_table = "scraper-data-terraform-state-locking"
    encrypt        = true
  }

}


resource "aws_ecr_repository" "scraper-runner" {
  name = "scraper-runner"
}

data "aws_ecr_image" "scraper_runner_image" {
  repository_name = "scraper-runner"
  image_tag       = "latest"
}

resource "aws_ecs_cluster" "scraper-runner" {
  name = "scraper-runner" # Naming the cluster
}

resource "aws_cloudwatch_log_group" "scraper_runner_logs" {
  name = "scraper-runner-logs"
}


resource "aws_ecs_task_definition" "bluewater-scraper-prod" {
  family                   = "bluewater-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "bluewater-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node", "new-scrapers/bluewater_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "estela-scraper-prod" {
  family                   = "estela-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "estela-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node", "new-scrapers/estela_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "georacing-scraper-prod" {
  family                   = "georacing-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "georacing-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=4096","new-scrapers/georacing_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 8192,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 8192        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "geovoile-scraper-prod" {
  family                   = "geovoile-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "geovoile-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","new-scrapers/geovoile_modern_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 8192,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 8192        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}



resource "aws_ecs_task_definition" "isail-scraper-prod" {
  family                   = "isail-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "isail-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","new-scrapers/isail_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "kattack-scraper-prod" {
  family                   = "kattack-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "kattack-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=4096","new-scrapers/kattack_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 8192,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 8192        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "kwindoo-scraper-prod" {
  family                   = "kwindoo-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "kwindoo-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=4096","new-scrapers/kwindoo_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 8192,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 8192        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "metasail-scraper-prod" {
  family                   = "metasail-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "metasail-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=12288","new-scrapers/metasail_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 16384,
      "cpu": 2048
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 16384        # Specifying the memory our container requires
  cpu                      = 2048        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "raceqs-scraper-prod" {
  family                   = "raceqs-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "raceqs-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=8048","new-scrapers/raceqs_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 12288,
      "cpu": 2048
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 12288        # Specifying the memory our container requires
  cpu                      = 2048        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "tacktracker-scraper-prod" {
  family                   = "tacktracker-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "tacktracker-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","new-scrapers/tacktracker_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "tractrac-scraper-prod" {
  family                   = "tractrac-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "tractrac-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=12288","new-scrapers/tractrac_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 16384,
      "cpu": 2048
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 16384        # Specifying the memory our container requires
  cpu                      = 2048        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}

resource "aws_ecs_task_definition" "yachtbot-scraper-prod" {
  family                   = "yachtbot-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "yachtbot-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=4096","new-scrapers/yachtbot_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 5120,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 5120        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}



resource "aws_ecs_task_definition" "yellowbrick-scraper-prod" {
  family                   = "yellowbrick-scraper-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "yellowbrick-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","--max_old_space_size=8048","new-scrapers/yellowbrick_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-prod-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 8192,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 8192        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}



resource "aws_security_group" "service_security_group" {
  vpc_id = "vpc-0ff1048764d18f262" # Referencing our syrf VPC
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_iam_role" "scraperTaskExecutionRole" {
  name               = "my_scraperTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com", "events.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "scraperTaskExecutionRole_policy" {
  role       = aws_iam_role.scraperTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# cloudwatch event for bluewater
resource "aws_cloudwatch_event_rule" "bluewater-scraper-prod-daily" {
  name                = "bluewater-scraper-prod-daily"
  description         = "Runs the bluewater scraper daily at 12:15AM (UTC)"
  schedule_expression = "cron(15 00 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "bluewater-scraper-prod-daily-target" {
  target_id = "bluewater-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.bluewater-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.bluewater-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch event for estela
resource "aws_cloudwatch_event_rule" "estela-scraper-prod-daily" {
  name                = "estela-scraper-prod-daily"
  description         = "Runs the estela scraper daily at 12:15AM (UTC)"
  schedule_expression = "cron(15 00 * * ? *)"
  is_enabled          = false // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "estela-scraper-prod-daily-target" {
  target_id = "estela-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.estela-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.estela-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch event for georacing
resource "aws_cloudwatch_event_rule" "georacing-scraper-prod-daily" {
  name                = "georacing-scraper-prod-daily"
  description         = "Runs the georacing scraper daily at 12:15AM (UTC)"
  schedule_expression = "cron(15 00 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "georacing-scraper-prod-daily-target" {
  target_id = "georacing-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.georacing-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.georacing-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch event for geovile
resource "aws_cloudwatch_event_rule" "geovoile-scraper-prod-daily" {
  name                = "geovoile-scraper-prod-daily"
  description         = "Runs the geovoile scraper daily at 1:15AM (UTC)"
  schedule_expression = "cron(15 01 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "geovoile-scraper-prod-daily-target" {
  target_id = "geovoile-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.geovoile-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.geovoile-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch event for isail
resource "aws_cloudwatch_event_rule" "isail-scraper-prod-daily" {
  name                = "isail-scraper-prod-daily"
  description         = "Runs the isail scraper daily at 12:30AM (UTC)"
  schedule_expression = "cron(30 00 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "isail-scraper-prod-daily-target" {
  target_id = "isail-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.isail-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.isail-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch event for kattack
resource "aws_cloudwatch_event_rule" "kattack-scraper-prod-daily" {
  name                = "kattack-scraper-prod-daily"
  description         = "Runs the kattack scraper daily at 12:30AM (UTC)"
  schedule_expression = "cron(30 00 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "kattack-scraper-prod-daily-target" {
  target_id = "kattack-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.kattack-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.kattack-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch events for kwindoo
resource "aws_cloudwatch_event_rule" "kwindoo-scraper-prod-daily" {
  name                = "kwindoo-scraper-prod-daily"
  description         = "Runs the kwindoo scraper daily at 12:30AM (UTC)"
  schedule_expression = "cron(30 00 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "kwindoo-scraper-prod-daily-target" {
  target_id = "kwindoo-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.kwindoo-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.kwindoo-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch events for metasail
resource "aws_cloudwatch_event_rule" "metasail-scraper-prod-daily" {
  name                = "metasail-scraper-prod-daily"
  description         = "Runs the metasail scraper daily at 12:45AM (UTC)"
  schedule_expression = "cron(45 00 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "metasail-scraper-prod-daily-target" {
  target_id = "metasail-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.metasail-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.metasail-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch events for raceqs
resource "aws_cloudwatch_event_rule" "raceqs-scraper-prod-daily" {
  name                = "raceqs-scraper-prod-daily"
  description         = "Runs the raceqs scraper daily at 03:30AM (UTC)"
  schedule_expression = "cron(30 03 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "raceqs-scraper-prod-daily-target" {
  target_id = "raceqs-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.raceqs-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.raceqs-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}


#cloudwatch events for tacktracker
resource "aws_cloudwatch_event_rule" "tacktracker-scraper-prod-daily" {
  name                = "tacktracker-scraper-prod-daily"
  description         = "Runs the tacktracker scraper daily at 1:15AM (UTC)"
  schedule_expression = "cron(15 01 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "tacktracker-scraper-prod-daily-target" {
  target_id = "tacktracker-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.tacktracker-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.tacktracker-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}


#cloudwatch events for tacktrac
resource "aws_cloudwatch_event_rule" "tractrac-scraper-prod-daily" {
  name                = "tractrac-scraper-prod-daily"
  description         = "Runs the tractrac scraper daily at 1:30AM (UTC)"
  schedule_expression = "cron(30 01 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "tractrac-scraper-prod-daily-target" {
  target_id = "tractrac-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.tractrac-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.tractrac-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch events for yatchbot
resource "aws_cloudwatch_event_rule" "yachtbot-scraper-prod-daily" {
  name                = "yachtbot-scraper-prod-daily"
  description         = "Runs the yachtbot scraper daily at 2:00AM (UTC)"
  schedule_expression = "cron(00 02 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "yachtbot-scraper-prod-daily-target" {
  target_id = "yachtbot-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.yachtbot-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.yachtbot-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}

#cloudwatch events for yellowbrick
resource "aws_cloudwatch_event_rule" "yellowbrick-scraper-prod-daily" {
  name                = "yellowbrick-scraper-prod-daily"
  description         = "Runs the yellowbrick scraper daily at 1:00AM (UTC)"
  schedule_expression = "cron(00 01 * * ? *)"
  is_enabled          = true // Change to true to enable scheduling
}

resource "aws_cloudwatch_event_target" "yellowbrick-scraper-prod-daily-target" {
  target_id = "yellowbrick-scraper-prod-daily-target"
  rule      = aws_cloudwatch_event_rule.yellowbrick-scraper-prod-daily.name
  arn       = aws_ecs_cluster.scraper-runner.arn
  role_arn  = aws_iam_role.scraperTaskExecutionRole.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.yellowbrick-scraper-prod.arn
    launch_type         = "FARGATE"
    network_configuration {
      subnets          = ["subnet-0c74e9237f0e03d25", "subnet-0b7890f3eaf4982da", "subnet-04283da759e25a84b"]
      assign_public_ip = true
      security_groups  = [aws_security_group.service_security_group.id]
    }
  }
}
