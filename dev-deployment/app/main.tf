terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "syrf-scrapper-dev-data-terraform-state"
    key    = "global/s3/terraform.tfstate"
    region = "us-east-1"

    dynamodb_table = "scraper-dev-data-terraform-state-locking"
    encrypt        = true
  }

}


resource "aws_ecr_repository" "scraper-runner" {
  name = "scraper-runner"
}

#data "aws_ecr_image" "scraper_runner_image" {
#  repository_name = "scraper-runner"
#  image_tag       = "latest"
#}

resource "aws_ecs_cluster" "scraper-runner" {
  name = "scraper-runner" # Naming the cluster
}

resource "aws_cloudwatch_log_group" "scraper_runner_logs" {
  name = "scraper-runner-logs"
}


resource "aws_ecs_task_definition" "bluewater-scraper-dev" {
  family                   = "bluewater-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "bluewater-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node", "new-scrapers/bluewater_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "estela-scraper-dev" {
  family                   = "estela-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "estela-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node", "new-scrapers/estela_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "georacing-scraper-dev" {
  family                   = "georacing-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "georacing-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","--max_old_space_size=4096","new-scrapers/georacing_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "geovoile-scraper-dev" {
  family                   = "geovoile-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "geovoile-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","new-scrapers/geovoile_modern_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}



resource "aws_ecs_task_definition" "isail-scraper-dev" {
  family                   = "isail-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "isail-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","new-scrapers/isail_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "kattack-scraper-dev" {
  family                   = "kattack-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "kattack-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","new-scrapers/kattack_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "kwindoo-scraper-dev" {
  family                   = "kwindoo-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "kwindoo-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","new-scrapers/kwindoo_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "metasail-scraper-dev" {
  family                   = "metasail-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "metasail-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","--max_old_space_size=8048","new-scrapers/metasail_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "raceqs-scraper-dev" {
  family                   = "raceqs-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "raceqs-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","--max_old_space_size=8048","new-scrapers/raceqs_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "tacktracker-scraper-dev" {
  family                   = "tacktracker-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "tacktracker-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","new-scrapers/tacktracker_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "tractrac-scraper-dev" {
  family                   = "tractrac-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "tractrac-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","--max_old_space_size=12288","new-scrapers/tractrac_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}

resource "aws_ecs_task_definition" "yachtbot-scraper-dev" {
  family                   = "yachtbot-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "yachtbot-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","new-scrapers/yachtbot_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}



resource "aws_ecs_task_definition" "yellowbrick-scraper-dev" {
  family                   = "yellowbrick-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "yellowbrick-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}",
      "essential": true,
      "command": ["node","--max_old_space_size=8048","new-scrapers/yellowbrick_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
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
  execution_role_arn       = aws_iam_role.devscraperTaskExecutionRole.arn
}





resource "aws_security_group" "service_security_group" {
  vpc_id = "vpc-02060b6e63c86da41" # Referencing our syrf VPC
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


resource "aws_iam_role" "devscraperTaskExecutionRole" {
  name               = "dev_scraperTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "devscraperTaskExecutionRole_policy" {
  role       = aws_iam_role.devscraperTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}







